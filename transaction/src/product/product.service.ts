import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Producer, Kafka, Message } from 'kafkajs';
import { KAFKA_CLIENT } from 'src/kafka/constant/kafka.constant';
import { IOrderTransactionPayload } from './interface/order-transaction-payload.interface';
import { ORDER_TRANSACTION_TOPIC } from './constant/order.constant';

@Injectable()
export class ProductService implements OnModuleInit, OnModuleDestroy {
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

  async sendOrderTransaction(payload: IOrderTransactionPayload) {
    const topic = ORDER_TRANSACTION_TOPIC;
    const messages: Message[] = [{ value: JSON.stringify(payload) }];

    await this.producer.send({ topic, messages });
  }
}
