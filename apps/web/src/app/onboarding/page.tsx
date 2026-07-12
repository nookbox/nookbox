import { redirect } from 'next/navigation';

import { getMyProfile } from '@/lib/api/users';
import { getSafeRedirectPath } from '@/lib/utils/get-safe-redirect-path';

type Props = {
  searchParams: Promise<{
    redirect_to?: string | string[];
  }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const { redirect_to } = await searchParams;
  const redirectTo = getSafeRedirectPath(redirect_to, '/', '/onboarding');

  const profile = await getMyProfile();
  if (profile) {
    redirect(redirectTo);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">온보딩 (준비 중)</h1>
      <p className="text-muted-foreground max-w-md">
        첫 로그인이에요. 프로필 설정 화면은 곧 추가됩니다.
      </p>
    </main>
  );
}
