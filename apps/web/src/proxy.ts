import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const session = getSessionCookie(req);
  if (!session) return NextResponse.redirect(new URL('/', req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/onboarding/:path*'],
};
