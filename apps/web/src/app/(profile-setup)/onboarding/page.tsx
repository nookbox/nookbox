import Onboarding from '@/features/onboarding';
import { getSafeRedirectPath } from '@/lib/utils/get-safe-redirect-path';

type Props = {
  searchParams: Promise<{
    redirect_to?: string | string[];
  }>;
};

/**
 *
 IdP(auth 서버)에서 최초 회원가입 후, nook DB에 유저 정보가 없을 때 표시되는 온보딩 페이지입니다.
 */
export default async function OnboardingPage({ searchParams }: Props) {
  const { redirect_to } = await searchParams;
  // URL을 직접 조작할 수 있으므로 콜백과 동일하게 내부 경로만 허용한다(오픈 리다이렉트 방어).
  const redirectTo = getSafeRedirectPath(redirect_to, '/', '/onboarding');

  return <Onboarding redirectTo={redirectTo} />;
}
