'use server';

import { updateProfile, type Profile } from '@/lib/api/users';

export async function updateProfileAction(input: {
  nickname: string;
  bio: string;
  file?: File;
}): Promise<Profile | null> {
  return updateProfile(input);
}
