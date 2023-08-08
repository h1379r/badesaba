import { Module } from '@nestjs/common';
import { BasketController } from './basket.controller';
import { BasketService } from './basket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Basket, BasketSchema } from './basket.schema';
import { BookModule } from 'src/book/book.module';
import { OrderModule } from 'src/order/order.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Basket.name, schema: BasketSchema }]),
    BookModule,
    OrderModule,
    TransactionModule,
    KafkaModule,
  ],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
