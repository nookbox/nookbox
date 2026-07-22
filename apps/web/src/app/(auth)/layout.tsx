import { Nav } from '@/components/shared/nav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nookbox-Onboarding',
  description: 'Nookbox',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav />

      {children}
    </>
  );
}
