import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import appEnvConfig from 'src/config/app-env.config';
import { IUserPayload } from 'src/user/interface/user-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user: IUserPayload;
    }
  }
}

@Injectable()
export class UserAuthGuard implements CanActivate {
  private jwtSecret: string;

  constructor(
    private jwtService: JwtService,
    configService: ConfigService<ConfigType<typeof appEnvConfig>>,
  ) {
    this.jwtSecret = configService.get('accessToken', { infer: true }).secret;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload: IUserPayload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
      });

      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
