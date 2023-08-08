import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import appEnvConfig from 'src/config/app-env.config';
import { URLSearchParams } from 'url';

@Injectable()
export class CaptchaService {
  constructor(
    private configService: ConfigService<ConfigType<typeof appEnvConfig>>,
    private httpService: HttpService,
  ) {}

  async verifyReCaptcha(captcha: string) {
    const reCaptchaEnvConfig = this.configService.get('reCaptcha', {
      infer: true,
    });

    const params = new URLSearchParams({
      secret: reCaptchaEnvConfig.secretKey,
      response: captcha,
    });

    const res = await lastValueFrom(
      this.httpService.post(
        'https://www.google.com/recaptcha/api/siteverify',
        params.toString(),
      ),
    );

    if (res.data.success !== true) {
      throw new BadRequestException('Invalid captcha');
    }

    return res.data;
  }
}
