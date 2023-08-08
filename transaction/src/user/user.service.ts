import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Message, Producer } from 'kafkajs';
import { KAFKA_CLIENT } from 'src/kafka/constant/kafka.constant';
import { USER_PLAN_TRANSACTION_TOPIC } from './constant/user-plan.constant';
import { IUserPlanTransactionPayload } from './interface/user-plan-transaction-payload.interface';

@Injectable()
export class UserService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;

  constructor(@Inject(KAFKA_CLIENT) private kafkaClient: Kafka) {
    this.producer = kafkaClient.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendUserPlanTransaction(payload: IUserPlanTransactionPayload) {
    const topic = USER_PLAN_TRANSACTION_TOPIC;
    const messages: Message[] = [{ value: JSON.stringify(payload) }];

    await this.producer.send({ topic, messages });
  }
}
