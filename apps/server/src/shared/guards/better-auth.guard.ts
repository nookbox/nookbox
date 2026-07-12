import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/shared/decorators/public.decorator';
import { fromNodeHeaders } from 'better-auth/node';
import { type Request } from 'express';

import { auth } from '@/lib/auth';
import { UsersService } from '@/modules/users/services/users.service';

import { type AuthenticatedUser } from '../decorators/current-user.decorator';

interface BetterAuthSessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const sessionUser = session.user as BetterAuthSessionUser;
    const appUser = await this.users.findById(sessionUser.id);
    if (!appUser) {
      throw new UnauthorizedException('Authentication required');
    }

    request.user = {
      id: sessionUser.id,
      sub: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      image: sessionUser.image ?? null,
      role: appUser.role,
    };

    return true;
  }
}
