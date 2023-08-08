import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { CaptchaService } from '../captcha.service';
import { CAPTCHA_HEADER } from '../constant/captcha.constant';

@Injectable()
export class ReCaptchaGuard implements CanActivate {
  constructor(private captchaService: CaptchaService) {}

  async canActivate(context: ExecutionContext) {
    /**
     * TODO: captcha is disabled for testing
     */
    return true;

    const request = context.switchToHttp().getRequest<Request>();

    // get captcha from header
    const captcha = request.header(CAPTCHA_HEADER);

    // validate captcha
    if (!captcha) {
      throw new BadRequestException('Invlid captcha');
    }

    // verify captcha
    await this.captchaService.verifyReCaptcha(captcha);

    return true;
  }
}
