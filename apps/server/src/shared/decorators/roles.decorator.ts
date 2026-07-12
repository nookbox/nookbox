import { SetMetadata } from '@nestjs/common';

import { type Role } from '@/shared/types/role';

export const ROLES_KEY = 'roles';

// @Roles('ADMIN') 처럼 핸들러/컨트롤러에 필요 권한을 붙인다. RolesGuard가 읽는다.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
