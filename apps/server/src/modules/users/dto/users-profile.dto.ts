import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * 닉네임 허용 문자: 한글(완성형) / 영문 / 숫자 / 밑줄.
 * DB CHECK 제약(`^[가-힣a-zA-Z0-9_]{2,20}$`)과 동일한 규칙을 앱 단에서도 검증한다.
 */
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9_]+$/;

const nickname = z
  .string()
  .trim()
  .min(2, '닉네임은 2~20자여야 합니다.')
  .max(20, '닉네임은 2~20자여야 합니다.')
  .regex(NICKNAME_REGEX, '닉네임은 한글, 영문, 숫자, _ 만 사용할 수 있어요.');

const bio = z.string().max(160, '소개는 160자 이하여야 합니다.');

export const createProfileSchema = z.object({
  nickname,
  bio: bio.optional(),
});

export class CreateProfileDto extends createZodDto(createProfileSchema) {}

export const updateProfileSchema = createProfileSchema.partial();

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}

export type UpdateProfileInput = z.infer<typeof updateProfileSchema> & {
  userId: string;
  file?: Express.Multer.File;
};
