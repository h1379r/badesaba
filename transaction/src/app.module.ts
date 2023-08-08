import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ZibalModule } from './zibal/zibal.module';
import appEnvConfig from './config/app-env.config';
import { AuthModule } from './auth/auth.module';
import { AuthzModule } from './authz/authz.module';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from './kafka/kafka.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';

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
    TransactionModule,
    ZibalModule,
    AuthModule,
    AuthzModule,
    KafkaModule,
    UserModule,
    ProductModule,
  ],
})
export class AppModule {}
