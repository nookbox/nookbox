// 내부 경로만 redirect 대상으로 허용하고, blockedPrefix로 시작하는 경로는 fallback으로 보낸다.
export function getSafeRedirectPath(
  value: string | string[] | undefined,
  fallbackPath = '/',
  blockedPrefix?: string,
) {
  if (typeof value !== 'string') {
    return fallbackPath;
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return fallbackPath;
  }

  if (blockedPrefix && value.startsWith(blockedPrefix)) {
    return fallbackPath;
  }

  return value;
}
