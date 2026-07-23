import 'server-only';

import { headers as nextHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

import { API_URL } from '@/lib/config';

export class ForbiddenError extends Error {}

type Options = Omit<RequestInit, 'body'> & { json?: unknown };

async function request<T>(
  method: string,
  path: string,
  opts: Options = {},
): Promise<T> {
  const { json, headers, ...rest } = opts;
  const cookie = (await nextHeaders()).get('cookie') ?? '';
  // FormData는 그대로 보낸다. content-type을 직접 붙이면 boundary가 빠져 파싱이 깨짐.
  const isForm = json instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    cache: 'no-store',
    ...rest,
    headers: {
      cookie,
      ...(json !== undefined && !isForm
        ? { 'content-type': 'application/json' }
        : {}),
      ...headers,
    },
    body: isForm
      ? (json as FormData)
      : json !== undefined
        ? JSON.stringify(json)
        : undefined,
  });

  if (res.status === 401) {
    // proxy.ts가 심어준 현재 경로. 재로그인 후 원래 보던 곳으로 돌려보낸다.
    const from = (await nextHeaders()).get('x-pathname');
    redirect(
      `/auth/error?error=session_expired` +
        (from ? `&from=${encodeURIComponent(from)}` : ''),
    );
  }
  if (res.status === 403) throw new ForbiddenError();
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`);

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T; // 200+빈응답 = undefined
}

export const api = {
  get: <T>(p: string, o?: Options) => request<T>('GET', p, o),
  post: <T>(p: string, json?: unknown, o?: Options) =>
    request<T>('POST', p, { ...o, json }),
  patch: <T>(p: string, json?: unknown, o?: Options) =>
    request<T>('PATCH', p, { ...o, json }),
  delete: <T>(p: string, o?: Options) => request<T>('DELETE', p, o),
};
