import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import appEnvConfig from 'src/config/app-env.config';

@Injectable()
export class RedisClient extends Redis {
  constructor(
    private configService: ConfigService<ConfigType<typeof appEnvConfig>>,
  ) {
    const redisEnvConfig = configService.get('redis', { infer: true });

    super({
      host: redisEnvConfig.host,
      port: redisEnvConfig.port,
      password: redisEnvConfig.password,
    });
  }
}
