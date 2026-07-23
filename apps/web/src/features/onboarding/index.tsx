import { ProfileEditForm } from '@/components/form';
import { getMyProfile } from '@/lib/api/users';
import { redirect } from 'next/navigation';

type Props = {
  redirectTo: string;
};

export default async function Onboarding({ redirectTo }: Props) {
  const profile = await getMyProfile();

  // 이미 프로필이 있으면(=온보딩 완료) URL 직접 진입을 막고 원래 가려던 곳으로 보낸다.
  if (profile) {
    redirect(redirectTo);
  }

  return <ProfileEditForm mode="onboarding" profile={profile} />;
}
