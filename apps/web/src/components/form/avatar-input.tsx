import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

import type { ProfileFormValues } from './profile-edit-form';

type AvatarInputProps = ControllerRenderProps<ProfileFormValues, 'avatar'>;

export function AvatarInput({
  value,
  onChange,
  onBlur,
  name,
  disabled,
}: AvatarInputProps) {
  // value 는 기존 이미지 URL(string) 또는 새로 고른 파일(File) 일 수 있다.
  // 미리보기 URL 은 렌더 중 파생하고, File 로 만든 objectURL 만 effect 에서 정리한다.
  const preview = useMemo(() => {
    if (value instanceof File) return URL.createObjectURL(value);
    if (typeof value === 'string') return value;
    return '';
  }, [value]);

  useEffect(() => {
    if (!preview.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const hasImage = Boolean(preview);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 실제 파일을 폼 값으로 넘긴다. 업로드는 저장 시 FormData 로 전송한다.
    onChange(file);
  };

  return (
    <div className='relative flex items-center gap-4'>
      <Avatar className='size-16'>
        <AvatarImage src={preview} />
        <AvatarFallback className='relative'>
          <Image
            src='/fullback.png'
            alt='기본 아바타'
            fill
            sizes='64px'
            className='rounded-full object-cover'
          />
        </AvatarFallback>
      </Avatar>

      <Tooltip>
        <TooltipTrigger asChild>
          <label
            htmlFor={name}
            className='absolute top-0 left-0 block size-16 cursor-pointer rounded-full border-2 border-green-200 transition-colors hover:border-green-300'
          />
        </TooltipTrigger>
        {!hasImage && (
          <TooltipContent>기본 이미지입니다. 수정해주세요</TooltipContent>
        )}
      </Tooltip>

      <input
        id={name}
        type='file'
        accept='image/*'
        className='hidden'
        disabled={disabled}
        onBlur={onBlur}
        onChange={onSelect}
      />
    </div>
  );
}
