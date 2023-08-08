import { Module } from '@nestjs/common';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from './vote.schema';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
    BookModule,
  ],
  controllers: [VoteController],
  providers: [VoteService],
})
export class VoteModule {}
