import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) return NextResponse.redirect(new URL('/', req.url));

  // 세션 만료로 401이 났을 때 어디로 돌려보낼지 알아야 해서 현재 경로를 넘긴다.
  const headers = new Headers(req.headers);
  headers.set('x-pathname', req.nextUrl.pathname + req.nextUrl.search);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/onboarding/:path*'],
};
