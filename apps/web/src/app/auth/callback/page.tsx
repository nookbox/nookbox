import { redirect } from 'next/navigation';

import { getMyProfile } from '@/lib/api/users';
import { getSafeRedirectPath } from '@/lib/utils/get-safe-redirect-path';

type Props = {
  searchParams: Promise<{
    redirect_to?: string | string[];
  }>;
};

// OIDC 로그인 성공 후 착지점. 프로필 없으면(=첫 가입) 온보딩으로, 있으면 원래 가려던 곳으로.
export default async function CallbackPage({ searchParams }: Props) {
  const { redirect_to } = await searchParams;
  const redirectTo = getSafeRedirectPath(redirect_to, '/', '/auth/callback');

  const myProfile = await getMyProfile();

  if (!myProfile) {
    redirect(`/onboarding?redirect_to=${encodeURIComponent(redirectTo)}`);
  }

  redirect(redirectTo);
}
