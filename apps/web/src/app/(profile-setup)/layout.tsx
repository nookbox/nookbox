import { BackHeader } from '@/components/shared/header';
import { headers } from 'next/headers';

const HEADER_TITLES: Record<string, string> = {
  '/onboarding': '프로필 설정',
  '/profile': '프로필 수정',
};

export default async function ProfileSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  return (
    <>
      <BackHeader title={HEADER_TITLES[pathname]} />
      <div className='flex flex-col items-center justify-center gap-4 p-4 md:min-h-0 md:py-12'>
        {children}
      </div>
    </>
  );
}
