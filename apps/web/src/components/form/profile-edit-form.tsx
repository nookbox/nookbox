'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { generateRandomNickname } from '@/lib/utils/generate-random-nickname';
import { useRouter } from 'next/navigation';
import { AvatarInput } from './avatar-input';
import { updateProfileAction } from './profile-actions';
import type { ProfileResDto } from '@/lib/api/generated';

const profileSchema = z.object({
  // 기존 이미지는 URL(string), 새로 고른 이미지는 File 로 들어온다.
  avatar: z.union([z.instanceof(File), z.string()]).optional(),
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.'),
  bio: z.string().max(160, '소갯말은 160자 이하여야 합니다.'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

type Props = {
  mode: 'onboarding' | 'edit';
  profile?: ProfileResDto | null;
};

export function ProfileEditForm({ mode = 'edit', profile }: Props) {
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      avatar: profile?.image ?? '',
      nickname: profile?.nickname ?? '',
      bio: profile?.bio ?? '',
    },
    resetOptions: { keepDirtyValues: true },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfileAction({
        nickname: data.nickname,
        bio: data.bio,
        // 새로 고른 파일일 때만 업로드한다. 기존 URL(string) 은 변경 없음으로 본다.
        file: data.avatar instanceof File ? data.avatar : undefined,
      });

      toast('프로필이 저장되었습니다.', {
        description: `닉네임: ${data.nickname}`,
        classNames: {
          description: '!text-popover-foreground !opacity-100 !font-semibold',
        },
      });

      router.refresh();
    } catch {
      toast.error('프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleCancel = async () => {
    if (mode === 'onboarding') {
      // 온보딩에서 취소 버튼 누르면 랜덤 닉네임으로 등록하고 진행
      const randomNickname = generateRandomNickname();
      await onSubmit({ ...form.getValues(), nickname: randomNickname });
      return;
    }

    form.reset();
  };

  const title = mode === 'onboarding' ? '프로필 설정' : '프로필 수정';
  const description =
    mode === 'onboarding'
      ? '닉네임과 소갯말을 설정해주세요'
      : '닉네임 또는 소갯말을 수정 할 수 있어요.';

  return (
    <Card className='w-full sm:max-w-md'>
      <CardHeader className='max-md:hidden'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <div className='flex justify-center'>
          <Controller
            name='avatar'
            control={form.control}
            render={({ field }) => <AvatarInput {...field} />}
          />
        </div>

        <form id='profile-edit-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name='nickname'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='profile-edit-nickname'>
                    닉네임
                  </FieldLabel>
                  <Input
                    {...field}
                    id='profile-edit-nickname'
                    aria-invalid={fieldState.invalid}
                    placeholder='닉네임을 입력하세요'
                    autoComplete='off'
                  />
                  <FieldDescription>2~20자로 입력해주세요.</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name='bio'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='profile-edit-bio'>소개</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id='profile-edit-bio'
                      placeholder='자신을 간단히 소개해보세요.'
                      rows={5}
                      className='max-h-24 min-h-24 resize-none overflow-auto'
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align='block-end'>
                      <InputGroupText className='tabular-nums'>
                        <span
                          className={`${field.value.length > 160 ? 'text-destructive' : ''}`}
                        >
                          {field.value.length}
                        </span>
                        /160
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation='horizontal' className='gap-3'>
          <Button
            type='button'
            variant='outline'
            className='h-11 flex-1'
            onClick={() => handleCancel()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type='submit'
            form='profile-edit-form'
            className='h-11 flex-1'
            disabled={isSubmitting}
          >
            저장
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
