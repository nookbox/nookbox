'use client';

import { useEffect, useState } from 'react';
import { appControllerHealth, type HealthDto } from '@/lib/api';

// hey-api 파이프라인 검증용: 서버 /health 를 타입 안전하게 호출.
export function ServerStatus() {
  const [health, setHealth] = useState<HealthDto | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    appControllerHealth()
      .then((res) => setHealth(res.data ?? null))
      .catch(() => setError(true));
  }, []);

  return (
    <p className="text-muted-foreground text-sm">
      server:{' '}
      {error ? (
        <span className="text-destructive">offline</span>
      ) : health ? (
        <span className="text-foreground">
          {health.service} · {health.status}
        </span>
      ) : (
        '…'
      )}
    </p>
  );
}
