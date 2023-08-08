import { Module } from '@nestjs/common';
import { PublisherController } from './publisher.controller';
import { PublisherService } from './publisher.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Publisher, PublisherSchema } from './publisher.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publisher.name, schema: PublisherSchema },
    ]),
  ],
  controllers: [PublisherController],
  providers: [PublisherService],
  exports: [MongooseModule],
})
export class PublisherModule {}
