import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './book.schema';
import { CategoryModule } from 'src/category/category.module';
import { AuthorModule } from 'src/author/author.module';
import { PublisherModule } from 'src/publisher/publisher.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    CategoryModule,
    AuthorModule,
    PublisherModule,
    RedisModule,
  ],
  controllers: [BookController],
  providers: [BookService],
  exports: [MongooseModule],
})
export class BookModule {}
