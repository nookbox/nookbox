'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LoginButton } from '@/components/shared/buttons/login-button';

const LINKS = [
  { href: '/', label: '홈' },
  { href: '/test', label: '테스트' },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      aria-current={pathname === href ? 'page' : undefined}
      className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground rounded-full px-4 py-3 text-sm font-normal transition-colors aria-[current=page]:bg-white/20 aria-[current=page]:font-medium"
    >
      {label}
    </Link>
  );
}

export function Nav() {
  return (
    <nav className="bg-background font-pretendard flex items-center gap-6 px-6 py-5">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="NOOKBOX"
          width={896}
          height={224}
          priority
          className="h-5 w-auto"
        />
      </Link>

      <ul className="flex gap-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <NavLink {...link} />
          </li>
        ))}
      </ul>

      <LoginButton className="ml-auto" />
    </nav>
  );
}
