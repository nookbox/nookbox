import { Suspense } from 'react';

import { AuthError } from '@/components/shared/auth-error';

// RP OAuth 콜백 실패 착지점 (better-auth onAPIError.errorURL). ?error=state_mismatch 등.
export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthError />
    </Suspense>
  );
}
