import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TokenModule } from './token/token.module';
import { AuthModule } from './auth/auth.module';
import { AuthzModule } from './authz/authz.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import appEnvConfig from './config/app-env.config';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpModule } from './otp/otp.module';
import { Ip2locationModule } from './ip2location/ip2location.module';
import { RedisModule } from './redis/redis.module';
import { NotificationModule } from './notification/notification.module';
import { CaptchaModule } from './captcha/captcha.module';
import { JwtModule } from '@nestjs/jwt';
import { PlanModule } from './plan/plan.module';
import { UserPlanModule } from './user-plan/user-plan.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appEnvConfig] }),
    MongooseModule.forRootAsync({
      useFactory: (
        configService: ConfigService<ConfigType<typeof appEnvConfig>>,
      ) => {
        const mongoEnvConfig = configService.get('mongo', { infer: true });

        return {
          uri: mongoEnvConfig.uri,
          auth: {
            username: mongoEnvConfig.username,
            password: mongoEnvConfig.password,
          },
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.register({ global: true }),
    UserModule,
    TokenModule,
    AuthModule,
    AuthzModule,
    RedisModule,
    OtpModule,
    Ip2locationModule,
    NotificationModule,
    CaptchaModule,
    PlanModule,
    UserPlanModule,
    KafkaModule,
  ],
})
export class AppModule {}
