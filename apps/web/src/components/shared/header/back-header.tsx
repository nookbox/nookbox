'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface BackHeaderProps {
  title?: string;
  onBack?: () => void;
}

export function BackHeader({ title, onBack }: BackHeaderProps) {
  const router = useRouter();

  return (
    <header className='sticky top-0 z-10 flex h-14 items-center gap-1 border-b bg-background/80 px-2 backdrop-blur md:hidden'>
      <Button
        variant='ghost'
        size='icon'
        aria-label='뒤로 가기'
        onClick={onBack ?? (() => router.back())}
      >
        <ChevronLeft className='size-5' />
      </Button>

      {title && (
        <h1 className='absolute left-1/2 -translate-x-1/2 text-base font-semibold'>
          {title}
        </h1>
      )}
    </header>
  );
}
