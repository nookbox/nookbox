'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LoginButton } from '@/components/shared/buttons/login-button';

const LINKS = [{ href: '/', label: '홈' }];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      aria-current={pathname === href ? 'page' : undefined}
      className="text-sm text-zinc-400 transition-colors hover:text-white aria-[current=page]:text-white"
    >
      {label}
    </Link>
  );
}

export function Nav() {
  return (
    <nav className="flex items-center gap-8 px-6 py-4">
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

      <ul className="flex gap-6">
        {LINKS.map((link) => (
          <li key={link.href}>
            <NavLink {...link} />
          </li>
        ))}
      </ul>

      <div className="ml-auto">
        <LoginButton />
      </div>
    </nav>
  );
}
