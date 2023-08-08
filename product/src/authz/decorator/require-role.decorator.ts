import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';

export const REQUIRE_ROLE_KEY = 'REQUIRE_ROLE';
export const RequireRole = (role: UserRoleEnum) =>
  SetMetadata(REQUIRE_ROLE_KEY, role);
