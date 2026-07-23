import 'server-only';

import { api } from '@/lib/api/server';
import type {
  ProfileResDto,
  UpdateProfileDto,
  UserResDto,
} from '@/lib/api/generated';

export type Me = UserResDto;
export type Profile = ProfileResDto;

export async function getMe(): Promise<Me> {
  return api.get<Me>('/users/me');
}

export async function getMyProfile(): Promise<Profile | null> {
  const profile = await api.get<Profile | null>('/users/me/profile');

  return profile ?? null;
}

export async function updateProfile(
  input: UpdateProfileDto & { file?: File },
): Promise<Profile | null> {
  const form = new FormData();

  if (input.nickname !== undefined) form.append('nickname', input.nickname);
  if (input.bio !== undefined) form.append('bio', input.bio);
  if (input.file) form.append('file', input.file);

  return api.patch<Profile | null>('/users/me/update-profile', form);
}
