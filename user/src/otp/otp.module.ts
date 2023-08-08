import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { OtpService } from './otp.service';

@Module({
  imports: [RedisModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
