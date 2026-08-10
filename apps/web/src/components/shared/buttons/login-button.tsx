'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { SSO_TRIED_COOKIE, SSO_TRIED_MAX_AGE_SECONDS } from '@/lib/sso';
import { cn } from '@/lib/utils';

function getCurrentPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getAuthCallbackURL(): string {
  const callbackUrl = new URL('/auth/callback', window.location.origin);
  callbackUrl.searchParams.set('redirect_to', getCurrentPath());
  return callbackUrl.toString();
}

/**
 * IdP 로그아웃(end_session) 주소를 백엔드에서 받아온다.
 * (주소에 필요한 id_token 은 서버 account 테이블에만 있다)
 *
 * 실패해도 던지지 않는다. IdP 장애로 로그아웃 자체가 막히면 안 되므로,
 * 그 경우 로컬 로그아웃만 한다.
 */
async function fetchIdpLogoutLink(): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  try {
    const response = await fetch(`${apiUrl}/api/auth/idp-logout-link`, {
      credentials: 'include',
    });

    if (!response.ok) return null;

    const { url } = (await response.json()) as { url: string | null };
    return url;
  } catch (error) {
    console.error('Failed to resolve IdP logout link:', error);
    return null;
  }
}

function notifyAuthError(error: unknown, fallbackMessage: string) {
  console.error('Auth request failed:', error);

  // 서버가 죽으면 status 없이 throw한다.
  const { status } = error as { status?: number };
  toast.error(
    !status || status >= 500
      ? '인증 서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.'
      : fallbackMessage,
  );
}

export function LoginButton({ className }: { className?: string }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const isUser = Boolean(session?.user);

  const handleLogin = async () => {
    try {
      // 성공 시 better-auth가 알아서 IdP로 리다이렉트.
      const { error } = await authClient.signIn.oauth2({
        providerId: 'nook-auth',
        callbackURL: getAuthCallbackURL(),
      });

      if (error) throw error;
    } catch (error) {
      notifyAuthError(error, '로그인에 실패했어요. 다시 시도해주세요.');
    }
  };

  const handleLogout = async () => {
    try {
      // signOut() 전에 받아야 한다. 세션이 없으면 서버가 id_token 을 못 찾는다.
      const idpLogoutLink = await fetchIdpLogoutLink();

      // 로그아웃 직후 미들웨어의 silent SSO 가 다시 로그인시키는 걸 막는다.
      // 로컬 로그아웃만 되는 경우(id_token 없음)에 특히 필요하다.
      document.cookie = `${SSO_TRIED_COOKIE}=1; path=/; max-age=${SSO_TRIED_MAX_AGE_SECONDS}; samesite=lax${
        window.location.protocol === 'https:' ? '; secure' : ''
      }`;

      await authClient.signOut();

      // IdP 세션까지 끊고 post_logout_redirect_uri 로 돌아온다.
      // 주소가 없으면 로컬 로그아웃만으로 끝낸다.
      if (idpLogoutLink) {
        window.location.href = idpLogoutLink;
        return;
      }

      router.refresh();
    } catch (error) {
      notifyAuthError(error, '로그아웃에 실패했어요. 다시 시도해주세요.');
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
      onClick={isUser ? handleLogout : handleLogin}
      className={cn('min-w-20', className)}
      disabled={!!isPending}
    >
      {LoginButtonText()}
    </Button>
  );
}
