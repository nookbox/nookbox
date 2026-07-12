import {
  createParamDecorator,
  InternalServerErrorException,
  type ExecutionContext,
} from '@nestjs/common';
import { type Role } from '@/shared/types/role';

export interface AuthenticatedUser {
  id: string;
  sub: string;
  email: string;
  name: string;
  image?: string | null;
  role?: Role;
}

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    if (!request.user) {
      throw new InternalServerErrorException(
        '@CurrentUser was used without auth guard',
      );
    }
    return request.user;
  },
);
