import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Basket } from './basket.schema';
import { Model, Types } from 'mongoose';
import { AddBookDto } from './dto/add-book.dto';
import { RemoveBookDto } from './dto/remove-book.dto';
import { Book } from 'src/book/book.schema';
import { IUserPayload } from 'src/user/interface/user-payload.interface';
import { Order } from 'src/order/order.schema';
import { OrderStatusEnum } from 'src/order/enum/order-status.enum';
import { TransactionTypeEnum } from 'src/transaction/enum/transaction-type.enum';
import { TransactionService } from 'src/transaction/transaction.service';
import { CheckoutDto } from './dto/checkout.dto';
import { Consumer, Kafka } from 'kafkajs';
import { KAFKA_CLIENT } from 'src/kafka/constant/kafka.constant';
import { ORDER_TRANSACTION_TOPIC } from 'src/order/constant/order.constant';
import { IOrderTransactionPayload } from 'src/order/interface/order-transaction-payload.interface';

@Injectable()
export class BasketService implements OnModuleInit, OnModuleDestroy {
  private transactionConsumer: Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) private kafkaClient: Kafka,
    @InjectModel(Basket.name) private basketModel: Model<Basket>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private transactionService: TransactionService,
  ) {
    // create transaction consumer
    this.transactionConsumer = this.kafkaClient.consumer({
      groupId: 'product-transaction',
    });
  }

  async onModuleInit() {
    // consumer connect
    await this.transactionConsumer.connect();

    await this.consumeOrderTransactions();
  }

  async onModuleDestroy() {
    // disconnect consumer
    await this.transactionConsumer.disconnect();
  }

  async consumeOrderTransactions() {
    await this.transactionConsumer.subscribe({
      topic: ORDER_TRANSACTION_TOPIC,
      fromBeginning: true,
    });

    await this.transactionConsumer.run({
      eachMessage: async ({ message }) => {
        const payload: IOrderTransactionPayload = JSON.parse(
          message.value.toString(),
        );

        await this.handleOrderTransaction(payload);
      },
    });
  }

  async getBooks(userPayload: IUserPayload) {
    const basket = await this.basketModel
      .findOne({ user: userPayload.id }, { _id: true })
      .populate({
        path: 'books',
        select: {
          title: 1,
          coverUrl: 1,
          publishYear: 1,
          beforeOffPrice: 1,
          price: 1,
          vip: 1,
          rating: 1,
          votesCount: 1,
        },
        populate: [
          {
            path: 'categories',
            select: { parent: 1, slug: 1, title: 1, icon: 1 },
          },
          {
            path: 'authors',
            select: { slug: 1, firstName: 1, lastName: 1, type: 1 },
          },
          { path: 'publisher', select: { slug: 1, title: 1 } },
        ],
      })
      .lean()
      .exec();

    return basket?.books || [];
  }

  async chkeout(checkoutDto: CheckoutDto, userPayload: IUserPayload) {
    // get user basket
    const basket = await this.basketModel
      .findOne({ user: userPayload.id }, { _id: true })
      .populate({ path: 'books', select: { price: 1 } })
      .lean()
      .exec();

    // throw error if user has no book in the basket
    if (!basket || !basket.books.length) {
      throw new BadRequestException('empty basket');
    }

    // calc price
    const price = basket.books.reduce((acc, curr) => acc + curr.price, 0);

    const books = basket.books.map((item) => item._id);

    let status: OrderStatusEnum;

    if (!price) {
      status = OrderStatusEnum.COMPLETED;
    } else {
      status = OrderStatusEnum.PENDING;
    }

    // create order
    const insertOrderResult = await this.orderModel.create({
      user: userPayload.id,
      books,
      price,
      status,
    });

    const order = insertOrderResult._id;

    if (status === OrderStatusEnum.PENDING) {
      // create transaction
      const transaction = await this.transactionService.createTransaction(
        {
          user: userPayload.id,
          orderId: order.toHexString(),
          amount: price,
          type: TransactionTypeEnum.ORDER,
          callbackUrl: checkoutDto.callbackUrl,
        },
        3,
      );

      // reject order if transaction is not successful
      if (!transaction.success) {
        await this.orderModel.updateOne(
          { _id: order },
          { $set: { status: OrderStatusEnum.FAILURE } },
        );

        throw new BadRequestException(transaction.message);
      }

      return { id: order.toHexString(), paymentUrl: transaction.result.url };
    } else {
      // make basket empty
      await this.basketModel.updateOne(
        { _id: basket },
        { $pullAll: { books } },
      );

      return { id: order.toHexString() };
    }
  }

  private async handleOrderTransaction(payload: IOrderTransactionPayload) {
    // find order
    const order = await this.orderModel
      .findOne({ _id: new Types.ObjectId(payload.id) }, { user: 1, books: 1 })
      .lean()
      .exec();

    if (!order) {
      return;
    }

    // update order status
    await this.orderModel.updateOne(
      { _id: order },
      { $set: { status: payload.status } },
    );

    // make basket empty if transaction is successful
    if (payload.status === OrderStatusEnum.COMPLETED) {
      await this.basketModel.updateOne(
        { user: order.user },
        { $pullAll: { books: order.books } },
      );
    }
  }

  async addBook(addBookDto: AddBookDto, userPayload: IUserPayload) {
    const book = new Types.ObjectId(addBookDto.book);

    const booksCount = await this.bookModel
      .countDocuments({ _id: book })
      .exec();

    // check that book is exists
    if (!booksCount) {
      throw new BadRequestException('Not found book');
    }

    // upsert basket
    await this.basketModel.updateOne(
      { user: userPayload.id },
      { $addToSet: { books: book } },
      { upsert: true },
    );

    return {};
  }

  async removeBook(removeBookDto: RemoveBookDto, userPayload: IUserPayload) {
    const book = new Types.ObjectId(removeBookDto.book);

    // remove book from basket
    const updateBasketResult = await this.basketModel.updateOne(
      { user: userPayload.id, books: book },
      { $pull: { books: book } },
    );

    // check that book is exists
    if (!updateBasketResult.matchedCount) {
      throw new BadRequestException('Not found book');
    }

    return {};
  }
}
