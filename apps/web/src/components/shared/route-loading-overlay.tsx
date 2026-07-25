'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { WalkLoaderOverlay } from '@/components/ui/walk-loader';

/**
 * 라우트가 바뀔 때마다 최소 표시 시간(minMs)만큼 걷기 로더를 띄운다.
 * 너무 빠른 전환의 깜빡임을 막는 용도 — 800ms = 걷기 1사이클.
 */
export function RouteLoadingOverlay({ minMs = 800 }: { minMs?: number }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), minMs);
    return () => clearTimeout(t);
  }, [pathname, minMs]);

  return loading ? <WalkLoaderOverlay /> : null;
}
