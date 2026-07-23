'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PropsWithChildren } from 'react';

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
      className="text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground rounded-full px-4 py-3 text-sm font-normal transition-colors hover:bg-white/8 aria-[current=page]:bg-white/20 aria-[current=page]:font-medium"
    >
      {label}
    </Link>
  );
}

export function Nav({ children }: PropsWithChildren) {
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

      {children}
    </nav>
  );
}

// 'use client' 모듈의 정적 프로퍼티(Nav.Right)는 서버 컴포넌트에서 참조하면
// undefined가 된다. 서버 레이아웃에서 쓰려면 별도 export여야 한다.
export function NavRight({ children }: PropsWithChildren) {
  return <div className="ml-auto flex items-center gap-2">{children}</div>;
}
