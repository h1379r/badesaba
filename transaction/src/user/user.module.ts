import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
