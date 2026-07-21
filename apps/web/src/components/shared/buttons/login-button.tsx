'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

function getCurrentPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getAuthCallbackURL(): string {
  const callbackUrl = new URL('/auth/callback', window.location.origin);
  callbackUrl.searchParams.set('redirect_to', getCurrentPath());
  return callbackUrl.toString();
}

export function LoginButton({ className }: { className?: string }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const isUser = Boolean(session?.user);

  const handleLogin = async () => {
    try {
      if (!isUser) {
        // 성공 시 better-auth가 알아서 IdP로 리다이렉트.
        const res = await authClient.signIn.oauth2({
          providerId: 'nook-auth',
          callbackURL: getAuthCallbackURL(),
        });

        if (res.error) {
          const { status, statusText, message } = res.error;
          console.error(
            `OAuth sign-in failed [${status} ${statusText}]: ${message ?? '알 수 없는 오류'}`,
          );
          toast.error(
            status >= 500
              ? '인증 서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.'
              : '로그인에 실패했어요. 다시 시도해주세요.',
          );
        }
      } else {
        await authClient.signOut();
        router.refresh();
      }
    } catch (error) {
      console.error('Auth request failed:', error);
      toast.error('인증 서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const LoginButtonText = () => {
    if (isPending) {
      return <Spinner className="h-4 w-4" />;
    }

    if (isUser) return '로그아웃';

    return '로그인';
  };

  return (
    <Button
      onClick={handleLogin}
      className={cn('min-w-20', className)}
      disabled={!!isPending}
    >
      {LoginButtonText()}
    </Button>
  );
}
