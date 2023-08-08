import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { ReCaptchaGuard } from './guard/re-captcha.guard';

@Global()
@Module({
  imports: [HttpModule],
  providers: [CaptchaService, ReCaptchaGuard],
  exports: [CaptchaService],
})
export class CaptchaModule {}
