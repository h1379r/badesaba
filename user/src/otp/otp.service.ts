import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as AsyncLock from 'async-lock';
import { RedisClient } from 'src/redis/redis.client';
import { OTP_DEFAULT_TTL } from './constant/otp-default.constant';
import { OTP_MAX_ATTEMPTS } from './constant/otp.constant';
import { OtpTypeEnum } from './enum/otp-type.enum';
import { ICreateOtpParams } from './interface/create-otp-params.interface';
import { IVerifyOtpParams } from './interface/verify-otp-params.interface';
import { randomNumberString } from 'src/util/random-number-string.util';

@Injectable()
export class OtpService {
  private lock: AsyncLock;

  constructor(private redisClient: RedisClient) {
    this.lock = new AsyncLock();
  }

  createOtp(createOtpParams: ICreateOtpParams) {
    const { id, type, operation, options } = createOtpParams;

    const otpKey = `${id}-${type}-${operation}`;
    const attemptsKey = `${otpKey}:attempts`;

    const otpTtl = options?.ttl ?? OTP_DEFAULT_TTL;
    const attemptsTtl = otpTtl + 10;

    return new Promise<string>((resolve, reject) => {
      this.lock
        .acquire(otpKey, async () => {
          // if timout is passed, search for previous otp in defined timout
          if (options?.timeout != null) {
            const previousOtp = await this.redisClient.get(otpKey);

            if (previousOtp != null) {
              const createdTime = +previousOtp.split(':')[0];

              if (
                createdTime >=
                Math.floor(Date.now() / 1000) - options?.timeout
              ) {
                throw new BadRequestException('try a few moments later');
              }
            }
          }

          const time = Math.floor(Date.now() / 1000);
          const code = this.generateCode(type);
          const otp = `${time}:${code}`;

          // create or replace attempts
          await this.redisClient.setex(attemptsKey, attemptsTtl, 0);

          // create or replace otp
          await this.redisClient.setex(otpKey, otpTtl, otp);

          return code;
        })
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  async verifyOtp(verifyOtpParams: IVerifyOtpParams) {
    const { code, id, type, operation } = verifyOtpParams;

    const otpKey = `${id}-${type}-${operation}`;
    const attemptsKey = `${otpKey}:attempts`;

    // get otp
    const otp = await this.redisClient.get(otpKey);

    if (otp == null) {
      throw new BadRequestException('otpCode.not_valid');
    }

    // get attempts
    const attemptsVal = await this.redisClient.get(attemptsKey);

    // return error if attemtps not exists
    if (attemptsVal == null) {
      throw new BadRequestException('otpCode.not_valid');
    }

    let attempts = +attemptsVal;

    // return error if number of attemps is over
    if (attempts >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestException('otpCode.not_valid');
    }

    // increment attemps
    attempts = await this.redisClient.incr(attemptsKey);

    // return error if number of attemps is over
    if (attempts > OTP_MAX_ATTEMPTS) {
      throw new BadRequestException('otpCode.not_valid');
    }

    // validate code
    const storedCode = otp.split(':')[1];

    if (storedCode != code) {
      throw new BadRequestException('otpCode.not_valid');
    }

    // delete keys
    await this.redisClient.del(otpKey, attemptsKey);
  }

  protected generateCode(type: OtpTypeEnum) {
    switch (type) {
      case OtpTypeEnum.SMS:
        return randomNumberString(6);
      default:
        return randomUUID();
    }
  }
}
