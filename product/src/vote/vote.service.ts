import { BadRequestException, Injectable } from '@nestjs/common';
import { SetVoteDto } from './dto/set-vote.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vote } from './vote.schema';
import { Model, Types } from 'mongoose';
import { IUserPayload } from 'src/user/interface/user-payload.interface';
import { Book } from 'src/book/book.schema';

@Injectable()
export class VoteService {
  constructor(
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
  ) {}

  async setVote(setVoteDto: SetVoteDto, userPayload: IUserPayload) {
    const book = await this.bookModel
      .findOne(
        { _id: new Types.ObjectId(setVoteDto.book) },
        { votesCount: 1, rating: 1 },
      )
      .lean()
      .exec();

    // check that book is exists
    if (!book) {
      throw new BadRequestException('Not found book');
    }

    // upsert vote
    const upsertVoteResult = await this.voteModel.updateOne(
      { book: book._id, user: userPayload.id },
      { $set: { score: setVoteDto.score } },
      { upsert: true },
    );

    // update book rating
    if (upsertVoteResult.matchedCount) {
      const rating =
        (book.votesCount * book.rating - book.rating + setVoteDto.score) /
        book.votesCount;

      await this.bookModel.updateOne({ _id: book }, { $set: { rating } });
    } else {
      const rating =
        (book.votesCount * book.rating + setVoteDto.score) /
        (book.votesCount + 1);

      await this.bookModel.updateOne(
        { _id: book },
        {
          $set: { rating },
          $inc: { votesCount: 1 },
        },
      );
    }

    return {};
  }
}
