import 'server-only';

import { serverApi } from '@/lib/api/server';

export type Role = 'USER' | 'ADMIN';

export type Profile = {
  userId: string;
  nickname: string | null;
  image: string | null;
  bio: string | null;
};

export async function getMyProfile(): Promise<Profile | null> {
  return (await serverApi.get<Profile>('/users/me/profile')) ?? null;
}
