import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

import { RP_COOKIE_PREFIX, SSO_TRIED_COOKIE } from '@/lib/sso';

export function proxy(req: NextRequest) {
  // 접두사 없이 찾으면 IdP 쿠키를 집거나 아예 못 찾는다.
  const session = getSessionCookie(req, { cookiePrefix: RP_COOKIE_PREFIX });
  const path = req.nextUrl.pathname + req.nextUrl.search;

  if (!session) {
    if (!req.cookies.has(SSO_TRIED_COOKIE)) {
      const silent = new URL('/auth/silent', req.url);
      silent.searchParams.set('redirect_to', path);
      return NextResponse.redirect(silent);
    }

    // silent SSO 까지 해봤는데 세션이 없다 = 진짜 비로그인 방문자.
    // 보호 경로만 막고 공개 페이지는 그대로 보여준다.
    if (req.nextUrl.pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }

  // 세션 만료로 401이 났을 때 어디로 돌려보낼지 알아야 해서 현재 경로를 넘긴다.
  const headers = new Headers(req.headers);
  headers.set('x-pathname', path);

  const response = NextResponse.next({ request: { headers } });

  // 루프 가드 정리. 남겨두면 다음에 세션이 끊겼을 때 자동 로그인이 안 된다.
  // (서버 컴포넌트에선 쿠키를 못 지워서 여기서 한다)
  if (req.cookies.has(SSO_TRIED_COOKIE)) {
    response.cookies.delete(SSO_TRIED_COOKIE);
  }

  return response;
}

export const config = {
  matcher: [
    // 페이지 요청만 잡는다.
    // /auth 제외: silent·callback 은 아직 세션이 없어 silent SSO 루프에 빠진다.
    // 확장자 경로 제외: 정적 파일마다 IdP 왕복을 시킬 수 없다.
    '/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\..*).*)',
  ],
};
