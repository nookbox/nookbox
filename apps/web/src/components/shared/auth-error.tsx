'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

// 에러 코드 → 사용자 안내. 대부분 "다시 로그인"으로 복구되는 시간초과/state 문제.
const MESSAGES: Record<string, string> = {
  state_mismatch: '로그인 세션이 만료됐어요. 다시 로그인해주세요.',
  invalid_signature: '로그인 요청이 만료됐어요. 다시 로그인해주세요.',
  session_expired: '세션이 만료됐어요. 다시 로그인해주세요.',
};

export function AuthError() {
  const error = useSearchParams().get('error') ?? '';
  const message =
    MESSAGES[error] ?? '로그인 중 문제가 발생했어요. 다시 시도해주세요.';

  const retry = async () => {
    const res = await authClient.signIn.oauth2({
      providerId: 'nook-auth',
      callbackURL: `${window.location.origin}/auth/callback?redirect_to=%2F`,
    });
    if (res.error) window.location.href = '/';
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">로그인 오류</h1>
      <p className="text-muted-foreground max-w-md">{message}</p>
      <div className="flex items-center gap-3">
        <Button onClick={retry} className="cursor-pointer">
          다시 로그인
        </Button>
        <Button asChild variant="outline">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </main>
  );
}
