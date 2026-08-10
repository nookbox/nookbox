import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AuthError } from '@/components/shared/auth-error';
import { SILENT_SSO_ERRORS } from '@/lib/sso';

type Props = {
  searchParams: Promise<{ error?: string | string[] }>;
};

// RP OAuth 콜백 실패 착지점 (better-auth onAPIError.errorURL). ?error=state_mismatch 등.
export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const code = Array.isArray(error) ? error[0] : error;

  // silent SSO 실패는 오류가 아니라 "로그인 안 됨"이니 조용히 홈으로.
  // (better-auth 가 errorCallbackURL 을 무시하고 여기로 보낸다)
  if (code && SILENT_SSO_ERRORS.has(code)) {
    redirect('/');
  }

  return (
    <Suspense>
      <AuthError />
    </Suspense>
  );
}
