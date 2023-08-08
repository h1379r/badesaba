import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Publisher } from './publisher.schema';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { GetPublisherDto } from './dto/get-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { GetPublishersListDto } from './dto/get-publishers-list.dto';

@Injectable()
export class PublisherService {
  constructor(
    @InjectModel(Publisher.name) private publisherModel: Model<Publisher>,
  ) {}

  async getPublisher(getPublisherDto: GetPublisherDto) {
    const filter: FilterQuery<Publisher> = {};

    if (getPublisherDto.id) {
      filter._id = new Types.ObjectId(getPublisherDto.id);
    } else {
      filter.slug = getPublisherDto.slug;
    }

    const publisher = await this.publisherModel.findOne(filter).lean().exec();

    if (!publisher) {
      throw new BadRequestException('Not found publisher');
    }

    return publisher;
  }

  async getPublishersList(getPublishersListDto: GetPublishersListDto) {
    const filter: FilterQuery<Publisher> = {};

    // create result query
    const resultPromise = this.publisherModel
      .find(filter, { slug: 1, title: 1 })
      .sort({ _id: -1 })
      .skip(getPublishersListDto.offset)
      .limit(getPublishersListDto.limit)
      .lean()
      .exec();

    // create total query
    const totalPromise = this.publisherModel.countDocuments({}).exec();

    // wait for result and total queries
    const [result, total] = await Promise.all([resultPromise, totalPromise]);

    return { total, result };
  }

  async createPublisher(createPublisherDto: CreatePublisherDto) {
    const slugsCount = await this.publisherModel
      .countDocuments({
        slug: createPublisherDto.slug,
      })
      .exec();

    // check is slug unique
    if (slugsCount) {
      throw new BadRequestException('Duplicate slug');
    }

    // insert publisher
    const insertPublisherResult = await this.publisherModel.create({
      slug: createPublisherDto.slug,
      title: createPublisherDto.title,
    });

    return { id: insertPublisherResult._id.toHexString() };
  }

  async updatePublisher(updatePublisherDto: UpdatePublisherDto) {
    const _id = new Types.ObjectId(updatePublisherDto.id);

    const publishersCount = await this.publisherModel
      .countDocuments({ _id })
      .exec();

    // check that publisher is exists
    if (!publishersCount) {
      throw new BadRequestException('Not found publisher');
    }

    // update publisher
    await this.publisherModel.updateOne(
      { _id },
      {
        $set: {
          title: updatePublisherDto.title,
        },
      },
    );

    return { id: updatePublisherDto.id };
  }
}
