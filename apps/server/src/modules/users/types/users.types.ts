import { type ProfileRow, type User } from '@/db/schema';

export type UserWithProfile = User & { profile: ProfileRow | null };
