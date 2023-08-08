import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { OtpModule } from 'src/otp/otp.module';
import { NotificationModule } from 'src/notification/notification.module';
import { TokenModule } from 'src/token/token.module';
import { PlanModule } from 'src/plan/plan.module';
import { UserPlanModule } from 'src/user-plan/user-plan.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    OtpModule,
    NotificationModule,
    TokenModule,
    PlanModule,
    UserPlanModule,
    TransactionModule,
    KafkaModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
