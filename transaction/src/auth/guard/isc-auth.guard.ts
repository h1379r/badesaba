import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Request } from 'express';
import appEnvConfig from 'src/config/app-env.config';

@Injectable()
export class IscAuthGuard implements CanActivate {
  private iscSecret: string;

  constructor(configService: ConfigService<ConfigType<typeof appEnvConfig>>) {
    this.iscSecret = configService.get('isc', { infer: true }).secret;
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const secret = request.headers.authorization;

    if (secret == null) {
      throw new UnauthorizedException();
    }

    if (secret !== this.iscSecret) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
