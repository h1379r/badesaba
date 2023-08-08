import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUIRE_ROLE_KEY } from './decorator/require-role.decorator';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';

@Injectable()
export class AuthzGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const userPayload = request.user;

    if (!userPayload) {
      throw new ForbiddenException();
    }

    const methodRole = this.reflector.get<UserRoleEnum>(
      REQUIRE_ROLE_KEY,
      context.getHandler(),
    );

    if (methodRole == null) {
      throw new ForbiddenException();
    }

    if (userPayload.role < methodRole) {
      throw new ForbiddenException();
    }

    return true;
  }
}
