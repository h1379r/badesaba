import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Author } from './author.schema';
import { GetAuthorDto } from './dto/get-author.dto';
import { GetAuthorsListDto } from './dto/get-authors-list.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(@InjectModel(Author.name) private authorModel: Model<Author>) {}

  async getAuthor(getAuthorDto: GetAuthorDto) {
    const filter: FilterQuery<Author> = {};

    if (getAuthorDto.id) {
      filter._id = new Types.ObjectId(getAuthorDto.id);
    } else {
      filter.slug = getAuthorDto.slug;
    }

    const author = await this.authorModel.findOne(filter).lean().exec();

    if (!author) {
      throw new NotFoundException('Not found author');
    }

    return author;
  }

  async getAuthorsList(getAuthorsListDto: GetAuthorsListDto) {
    const filter: FilterQuery<Author> = {};

    // create result query
    const resultPromise = this.authorModel
      .find(filter, { slug: 1, firstName: 1, lastName: 1, type: 1 })
      .sort({ _id: -1 })
      .skip(getAuthorsListDto.offset)
      .limit(getAuthorsListDto.limit)
      .lean()
      .exec();

    // create total query
    const totalPromise = this.authorModel.countDocuments({}).exec();

    // wait for result and total queries
    const [result, total] = await Promise.all([resultPromise, totalPromise]);

    return { total, result };
  }

  async createAuthor(createAuthorDto: CreateAuthorDto) {
    const slugsCount = await this.authorModel
      .countDocuments({
        slug: createAuthorDto.slug,
      })
      .exec();

    // check is slug unique
    if (slugsCount) {
      throw new BadRequestException('Duplicate slug');
    }

    // insert author
    const insertAuthorResult = await this.authorModel.create({
      slug: createAuthorDto.slug,
      firstName: createAuthorDto.firstName,
      lastName: createAuthorDto.lastName,
      description: createAuthorDto.description,
      type: createAuthorDto.type,
      nationality: createAuthorDto.nationality,
      birthYear: createAuthorDto.birthYear,
    });

    return { id: insertAuthorResult._id.toHexString() };
  }

  async updateAuthor(updateAuthorDto: UpdateAuthorDto) {
    const _id = new Types.ObjectId(updateAuthorDto.id);

    const authorsCount = await this.authorModel.countDocuments({ _id }).exec();

    // check that author is exists
    if (!authorsCount) {
      throw new BadRequestException('Not found author');
    }

    // update author
    await this.authorModel.updateOne(
      { _id },
      {
        $set: {
          firstName: updateAuthorDto.firstName,
          lastName: updateAuthorDto.lastName,
          description: updateAuthorDto.description,
          type: updateAuthorDto.type,
          nationality: updateAuthorDto.nationality,
          birthYear: updateAuthorDto.birthYear,
        },
      },
    );

    return { id: updateAuthorDto.id };
  }
}
