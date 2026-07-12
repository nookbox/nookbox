import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const profileResSchema = z.object({
  userId: z.string(),
  nickname: z.string().nullable(),
  image: z.string().nullable(),
  bio: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export class ProfileResDto extends createZodDto(profileResSchema) {}

export const userResSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  nickname: z.string().nullable(),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.string(),
  updatedAt: z.string(),
  profile: profileResSchema.nullable(),
});

export class UserResDto extends createZodDto(userResSchema) {}

export const uploadImageResSchema = z.object({
  imageUrl: z.string(),
});

export class UploadImageResDto extends createZodDto(uploadImageResSchema) {}
