import { LoginButton } from '@/components/shared/buttons/login-button';
import { Nav, NavRight } from '@/components/shared/nav';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav>
        <NavRight>
          <LoginButton className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 transition-[filter] hover:brightness-110" />
        </NavRight>
      </Nav>

      {children}
    </>
  );
}
