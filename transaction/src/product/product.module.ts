import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
