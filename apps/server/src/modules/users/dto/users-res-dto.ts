import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * 응답 스키마는 JSON 직렬화 이후의 "와이어 포맷"을 모델링한다.
 * Drizzle은 `Date` 객체를 돌려주지만 HTTP 응답에서는 ISO 문자열이 되므로
 * 날짜 필드는 `z.string()`으로 둔다.
 */
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
