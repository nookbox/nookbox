import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Role } from '@/shared/types/role';
import { ROLES_KEY } from '@/shared/decorators/roles.decorator';

import { UsersService } from '@/modules/users/services/users.service';

import { type AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const payload = request.user;
    if (!payload) {
      throw new ForbiddenException('Authentication required');
    }

    if (payload.role && requiredRoles.includes(payload.role)) {
      return true;
    }

    const dbUser = await this.users.findById(payload.sub);
    if (!dbUser || !requiredRoles.includes(dbUser.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
