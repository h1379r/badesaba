import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './book.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { Category } from 'src/category/category.schema';
import { Author } from 'src/author/author.schema';
import { Publisher } from 'src/publisher/publisher.schema';
import { UpdateBookDto } from './dto/update-book.dto';
import { GetBookDto } from './dto/get-book.dto';
import { GetBooksListDto } from './dto/get-books-list.dto';
import { GetRowBooksDto } from './dto/get-row-books.dto';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
} from 'src/common/constant/pagination.constant';
import { BookSortType } from './enum/book-sort-type.enum';
import { RedisClient } from 'src/redis/redis.client';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Author.name) private authorModel: Model<Author>,
    @InjectModel(Publisher.name) private publisherModel: Model<Publisher>,
    private redisClient: RedisClient,
  ) {}

  async getBook(getBookDto: GetBookDto) {
    const _id = new Types.ObjectId(getBookDto.id);

    const book = await this.bookModel
      .findOne({ _id })
      .populate('categories')
      .populate('authors')
      .populate('publisher')
      .lean()
      .exec();

    if (!book) {
      throw new NotFoundException('Not found book');
    }

    return book;
  }

  async getBooksList(getBooksListDto: GetBooksListDto) {
    const filter: FilterQuery<Book> = {};

    if (getBooksListDto.title) {
      filter.$text = { $search: getBooksListDto.title };
    }

    if (getBooksListDto.publishYear) {
      filter.publishYear = getBooksListDto.publishYear;
    }

    if (getBooksListDto.category) {
      // find category and childs
      const category = new Types.ObjectId(getBooksListDto.category);

      const categories = await this.categoryModel
        .find({ $or: [{ _id: category }, { parent: category }] }, { _id: 1 })
        .lean()
        .exec();

      if (categories.length) {
        filter.categories = { $in: categories.map((item) => item._id) };
      } else {
        throw new BadRequestException('Not found category');
      }
    }

    if (getBooksListDto.author) {
      const author = new Types.ObjectId(getBooksListDto.author);

      const authorsCount = await this.authorModel
        .countDocuments({ _id: author })
        .exec();

      // check that author is exists
      if (!authorsCount) {
        throw new BadRequestException('Not found author');
      }

      filter.authors = author;
    }

    if (getBooksListDto.publisher) {
      const publisher = new Types.ObjectId(getBooksListDto.publisher);

      const publishersCount = await this.publisherModel
        .countDocuments({ _id: publisher })
        .exec();

      // check that publisher is exists
      if (!publishersCount) {
        throw new BadRequestException('Not found publisher');
      }

      filter.publisher = publisher;
    }

    // create result query
    const resultPromise = this.findBooksResult(
      filter,
      getBooksListDto.sort,
      getBooksListDto.offset,
      getBooksListDto.limit,
    );

    // create total query
    const totalPromise = this.bookModel.countDocuments(filter).exec();

    // wait for result and total queries
    const [result, total] = await Promise.all([resultPromise, totalPromise]);

    return { total, result };
  }

  async getRowBooks(getRowBooksDto: GetRowBooksDto) {
    // create cache key
    const cacheKey = `row-books-${getRowBooksDto.sort ?? ''}-${
      getRowBooksDto.category ?? ''
    }-${getRowBooksDto.author ?? ''}-${getRowBooksDto.publisher ?? ''}`;
    const cacheTtl = 120;

    // read from cache
    const cachedResult = await this.redisClient.get(cacheKey);

    // return result if cache is exists
    if (cachedResult) {
      return JSON.parse(cachedResult) as any[];
    }

    const filter: FilterQuery<Book> = {};

    if (getRowBooksDto.category) {
      // find category and childs
      const category = new Types.ObjectId(getRowBooksDto.category);

      const categories = await this.categoryModel
        .find({ $or: [{ _id: category }, { parent: category }] }, { _id: 1 })
        .lean()
        .exec();

      if (categories.length) {
        filter.categories = { $in: categories.map((item) => item._id) };
      } else {
        throw new BadRequestException('Not found category');
      }
    }

    if (getRowBooksDto.author) {
      const author = new Types.ObjectId(getRowBooksDto.author);

      const authorsCount = await this.authorModel
        .countDocuments({ _id: author })
        .exec();

      // check that author is exists
      if (!authorsCount) {
        throw new BadRequestException('Not found author');
      }

      filter.authors = author;
    }

    if (getRowBooksDto.publisher) {
      const publisher = new Types.ObjectId(getRowBooksDto.publisher);

      const publishersCount = await this.publisherModel
        .countDocuments({ _id: publisher })
        .exec();

      // check that publisher is exists
      if (!publishersCount) {
        throw new BadRequestException('Not found publisher');
      }

      filter.publisher = publisher;
    }

    // wait for result
    const result = await this.findBooksResult(filter, getRowBooksDto.sort);

    // cache result
    if (result.length) {
      await this.redisClient.setex(cacheKey, cacheTtl, JSON.stringify(result));
    }

    return result;
  }

  private async findBooksResult(
    filter: FilterQuery<Book>,
    sort: BookSortType,
    offset = DEFAULT_OFFSET,
    limit = DEFAULT_LIMIT,
  ) {
    const resultQuery = this.bookModel
      .aggregate()
      .match(filter)
      .project({
        title: 1,
        coverUrl: 1,
        publishYear: 1,
        beforeOffPrice: 1,
        price: 1,
        vip: 1,
        rating: 1,
        votesCount: 1,
        categories: 1,
        authors: 1,
        publisher: 1,
      })
      .lookup({
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
        pipeline: [{ $project: { parent: 1, slug: 1, title: 1, icon: 1 } }],
      })
      .lookup({
        from: 'authors',
        localField: 'authors',
        foreignField: '_id',
        as: 'authors',
        pipeline: [
          { $project: { slug: 1, firstName: 1, lastName: 1, type: 1 } },
        ],
      })
      .lookup({
        from: 'publishers',
        localField: 'publisher',
        foreignField: '_id',
        as: 'publisher',
        pipeline: [
          {
            $project: { slug: 1, title: 1 },
          },
        ],
      })
      .unwind({ path: '$publisher', preserveNullAndEmptyArrays: true });

    if (sort === BookSortType.FAVORITES) {
      // find book with max votes count
      const maxVotesCountBook = (
        await this.bookModel
          .find({}, { votesCount: 1 })
          .sort({ votesCount: -1 })
          .limit(1)
          .lean()
          .exec()
      )[0];

      const maxVotesCount = maxVotesCountBook?.votesCount || 1;

      // add new field to sort favorites and remove it after sort
      resultQuery
        .addFields({
          r: {
            $add: [
              { $divide: ['$votesCount', maxVotesCount] },
              { $multiply: [{ $divide: ['$rating', 5] }, 2] },
            ],
          },
        })
        .sort({ r: -1, _id: -1 })
        .project({ r: 0 });
    } else if (sort === BookSortType.NEWESTS) {
      resultQuery.sort({ _id: -1 });
    } else if (sort === BookSortType.BEST_SELLERS) {
      resultQuery.sort({ salesCount: -1, _id: -1 });
    } else {
      resultQuery.sort({ _id: -1 });
    }

    const result = await resultQuery.skip(offset).limit(limit).exec();

    return result;
  }

  async createBook(createBookDto: CreateBookDto) {
    const categories = createBookDto.categories.map(
      (item) => new Types.ObjectId(item),
    );

    const categoriesCount = await this.categoryModel
      .countDocuments({
        _id: { $in: categories },
      })
      .exec();

    // check that all entered categories are exist
    if (categoriesCount !== createBookDto.categories.length) {
      throw new BadRequestException('Not found category');
    }

    const authors = createBookDto.authors.map(
      (item) => new Types.ObjectId(item),
    );

    const authorsCount = await this.authorModel
      .countDocuments({
        _id: { $in: authors },
      })
      .exec();

    // check that all entered authors are exist
    if (authorsCount !== createBookDto.authors.length) {
      throw new BadRequestException('Not found author');
    }

    const publisher = new Types.ObjectId(createBookDto.publisher);

    const publishersCount = await this.publisherModel
      .countDocuments({ _id: publisher })
      .exec();

    // check that entered publisher is exists
    if (!publishersCount) {
      throw new BadRequestException('Not found publisher');
    }

    // insert book
    const insertBookResult = await this.bookModel.create({
      title: createBookDto.title,
      description: createBookDto.description,
      coverUrl: createBookDto.coverUrl,
      publishYear: createBookDto.publishYear,
      beforeOffPrice: createBookDto.beforeOffPrice,
      vip: createBookDto.vip,
      price: createBookDto.price,
      categories,
      authors,
      publisher,
    });

    return { id: insertBookResult._id.toHexString() };
  }

  async updateBook(updateBookDto: UpdateBookDto) {
    const _id = new Types.ObjectId(updateBookDto.id);

    const booksCount = await this.bookModel.countDocuments({ _id }).exec();

    // check that book is exists
    if (!booksCount) {
      throw new BadRequestException('Not found book');
    }

    const categories = updateBookDto.categories.map(
      (item) => new Types.ObjectId(item),
    );

    const categoriesCount = await this.categoryModel
      .countDocuments({
        _id: { $in: categories },
      })
      .exec();

    // check that all entered categories are exist
    if (categoriesCount !== updateBookDto.categories.length) {
      throw new BadRequestException('Not found category');
    }

    const authors = updateBookDto.authors.map(
      (item) => new Types.ObjectId(item),
    );

    const authorsCount = await this.authorModel
      .countDocuments({
        _id: { $in: authors },
      })
      .exec();

    // check that all entered authors are exist
    if (authorsCount !== updateBookDto.authors.length) {
      throw new BadRequestException('Not found author');
    }

    const publisher = new Types.ObjectId(updateBookDto.publisher);

    const publishersCount = await this.publisherModel
      .countDocuments({ _id: publisher })
      .exec();

    // check that entered publisher is exists
    if (!publishersCount) {
      throw new BadRequestException('Not found publisher');
    }

    // update book
    await this.bookModel.updateOne(
      { _id },
      {
        $set: {
          title: updateBookDto.title,
          description: updateBookDto.description,
          coverUrl: updateBookDto.coverUrl,
          publishYear: updateBookDto.publishYear,
          beforeOffPrice: updateBookDto.beforeOffPrice,
          price: updateBookDto.price,
          vip: updateBookDto.vip,
          categories,
          authors,
          publisher,
        },
      },
    );

    return { id: updateBookDto.id };
  }
}
