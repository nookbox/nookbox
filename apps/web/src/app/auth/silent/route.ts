import { NextResponse, type NextRequest } from 'next/server';

import { API_URL, PUBLIC_ORIGIN } from '@/lib/config';
import { SSO_TRIED_COOKIE, SSO_TRIED_MAX_AGE_SECONDS } from '@/lib/sso';
import { getSafeRedirectPath } from '@/lib/utils/get-safe-redirect-path';

/**
 * 이 요청이 들어온 공개 오리진.
 *
 * ⚠️ req.nextUrl.origin 은 컨테이너에서 https://0.0.0.0:3030 이 나온다.
 *    trustedOrigins 에 없어 403 → silent SSO 가 조용히 실패한다.
 *    그래서 운영에서는 PUBLIC_ORIGIN 을 못박아 쓴다.
 *
 * ⚠️ x-forwarded-host 로 복원하지 않는다. 클라이언트가 위조할 수 있는 헤더인데
 *    앞단 cloudflared 는 이걸 덮어쓰지 않는다. 아래 폴백은 프록시가 없는
 *    로컬 개발용이다.
 */
function publicOrigin(req: NextRequest): string {
  if (PUBLIC_ORIGIN) return PUBLIC_ORIGIN;

  const host = req.headers.get('host');
  if (!host) return req.nextUrl.origin;

  return `${req.nextUrl.protocol.replace(':', '')}://${host}`;
}

/**
 * Silent SSO 진입점. 미들웨어가 세션 없는 방문자를 여기로 보낸다.
 * RP 백엔드에서 authorize URL 을 받아 prompt=none 을 붙이고, 루프 가드를
 * 심은 뒤 IdP 로 보낸다.
 *
 * ⚠️ URL 을 직접 조립하지 않는 이유: state·PKCE verifier 는 better-auth 가
 *    만들어 콜백에서 대조한다. 흉내내면 state_mismatch 가 난다.
 * ⚠️ prompt=none 은 config 의 authorizationUrlParams 가 아니라 이 요청에만
 *    붙인다. 전역으로 켜면 실제 로그인 버튼까지 막힌다.
 */
export async function GET(req: NextRequest) {
  const redirectTo = getSafeRedirectPath(
    req.nextUrl.searchParams.get('redirect_to') ?? undefined,
    '/',
    '/auth',
  );

  const origin = publicOrigin(req);
  const fallback = NextResponse.redirect(new URL(redirectTo, origin));

  // 성공·실패 관계없이 가드를 심어 무한 리다이렉트를 막는다.
  const setGuard = (response: NextResponse) => {
    response.cookies.set(SSO_TRIED_COOKIE, '1', {
      path: '/',
      maxAge: SSO_TRIED_MAX_AGE_SECONDS,
      sameSite: 'lax',
      secure: origin.startsWith('https://'),
    });
    return response;
  };

  try {
    const callbackURL = new URL('/auth/callback', origin);
    callbackURL.searchParams.set('redirect_to', redirectTo);

    const response = await fetch(`${API_URL}/api/auth/sign-in/social`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: req.headers.get('cookie') ?? '',
        // ⚠️ 빼먹으면 403 MISSING_OR_NULL_ORIGIN. better-auth 는 쿠키 실린
        //    POST 에 Origin 을 요구하는데 서버 fetch 는 자동으로 안 붙인다.
        //    catch 가 삼켜서 그냥 실패하는 것처럼만 보이니 주의.
        //    RP 의 trustedOrigins 에 들어있어야 한다.
        origin,
      },
      body: JSON.stringify({
        provider: 'nook-auth',
        callbackURL: callbackURL.toString(),
        errorCallbackURL: new URL(redirectTo, origin).toString(),
        disableRedirect: true,
      }),
    });

    if (!response.ok) return setGuard(fallback);

    const { url } = (await response.json()) as { url?: string };
    if (!url) return setGuard(fallback);

    const authorizeUrl = new URL(url);
    // 핵심. IdP 세션이 없으면 로그인 화면을 띄우지 말고 즉시 에러로 돌려보내라.
    authorizeUrl.searchParams.set('prompt', 'none');

    const redirect = setGuard(NextResponse.redirect(authorizeUrl));

    // state·PKCE 쿠키를 브라우저로 넘긴다. 이걸 빼먹으면 콜백에서
    // state_mismatch 로 죽는다.
    for (const cookie of response.headers.getSetCookie()) {
      redirect.headers.append('set-cookie', cookie);
    }

    return redirect;
  } catch (error) {
    console.error('Silent SSO failed:', error);
    return setGuard(fallback);
  }
}
