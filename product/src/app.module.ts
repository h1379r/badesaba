import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BookModule } from './book/book.module';
import { AuthorModule } from './author/author.module';
import { CategoryModule } from './category/category.module';
import { PublisherModule } from './publisher/publisher.module';
import appEnvConfig from './config/app-env.config';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { AuthzModule } from './authz/authz.module';
import { JwtModule } from '@nestjs/jwt';
import { VoteModule } from './vote/vote.module';
import { BasketModule } from './basket/basket.module';
import { OrderModule } from './order/order.module';
import { TransactionModule } from './transaction/transaction.module';
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
    BookModule,
    AuthorModule,
    CategoryModule,
    PublisherModule,
    RedisModule,
    AuthModule,
    AuthzModule,
    VoteModule,
    BasketModule,
    OrderModule,
    TransactionModule,
    KafkaModule,
  ],
})
export class AppModule {}
