import { Injectable, NotFoundException } from '@nestjs/common';
import { ZibalService } from 'src/zibal/zibal.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './transaction.schema';
import { Model, Types } from 'mongoose';
import { Request, Response } from 'express';
import { TransactionStatusEnum } from './enum/transaction-status.enum';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { IUserPayload } from 'src/user/interface/user-payload.interface';
import { ConfigService, ConfigType } from '@nestjs/config';
import appEnvConfig from 'src/config/app-env.config';
import { concatUrl } from 'src/util/concat-url.util';
import { TransactionTypeEnum } from './enum/transaction-type.enum';
import { UserService } from 'src/user/user.service';
import { IUserPlanTransactionPayload } from 'src/user/interface/user-plan-transaction-payload.interface';
import { UserPlanStatusEnum } from 'src/user/enum/user-paln-status.enum';
import { IOrderTransactionPayload } from 'src/product/interface/order-transaction-payload.interface';
import { OrderStatusEnum } from 'src/product/enum/order-status.enum';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private zibalService: ZibalService,
    private userService: UserService,
    private productService: ProductService,
    private configService: ConfigService<ConfigType<typeof appEnvConfig>>,
  ) {}

  async getTransaction(
    getTransactionDto: GetTransactionDto,
    userPayload: IUserPayload,
  ) {
    const _id = new Types.ObjectId(getTransactionDto.id);

    // find transaction
    const transaction = await this.transactionModel
      .findOne(
        { _id, user: userPayload.id },
        { orderId: 1, amount: 1, trackId: 1, type: 1, status: 1 },
      )
      .lean()
      .exec();

    if (!transaction) {
      throw new NotFoundException('Not found transaction');
    }

    return transaction;
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    // create payment callback url
    const domain = this.configService.get('domain', { infer: true });
    const pathPrefix = this.configService.get('pathPrefix', { infer: true });

    const callbackUrl = concatUrl(domain, pathPrefix, 'v1/transaction/verify');

    // create payment
    const payment = await this.zibalService.reqestPayment({
      amount: createTransactionDto.amount,
      callbackUrl,
    });

    if (!payment.success) {
      return { success: false, message: payment.message };
    }

    // create transaction
    const insertTransactionResult = await this.transactionModel.create({
      user: createTransactionDto.user,
      orderId: createTransactionDto.orderId,
      amount: createTransactionDto.amount,
      trackId: payment.result.trackId,
      type: createTransactionDto.type,
      callbackUrl: createTransactionDto.callbackUrl,
    });

    return {
      success: true,
      message: payment.message,
      result: {
        id: insertTransactionResult._id.toHexString(),
        trackId: payment.result.trackId,
        url: payment.result.url,
      },
    };
  }

  async verifyTransaction(request: Request, response: Response) {
    const trackId = request.query.trackId as string;

    // find transaction
    const transaction = await this.transactionModel
      .findOne({ trackId }, {})
      .lean()
      .exec();

    const callbackUrl = new URL(transaction.callbackUrl);
    callbackUrl.searchParams.append('id', transaction._id.toHexString());

    // redirect request if trnasaction status is changed
    if (transaction.status !== TransactionStatusEnum.PENDING) {
      callbackUrl.searchParams.append('status', transaction.status.toString());

      return response.redirect(callbackUrl.href);
    }

    // verify payment
    const payment = await this.zibalService.veifyPayment({ trackId });

    let status: TransactionStatusEnum;

    // define status according to payment result
    if (payment.success) {
      status = TransactionStatusEnum.COMPLETED;
    } else {
      status = TransactionStatusEnum.FAILURE;
    }

    // update transaction
    await this.transactionModel.updateOne(
      { _id: transaction._id, status: TransactionStatusEnum.PENDING },
      {
        $set: {
          status,
          paidAt: payment.result?.paidAt,
          cardNumber: payment.result?.cardNumber,
          paymentStatus: payment.result?.status,
          paymentStatusMessage: payment.result?.statusMessage,
          refNumber: payment.result?.refNumber,
        },
      },
    );

    // send transaction event
    if (transaction.type === TransactionTypeEnum.PLAN) {
      const payload: IUserPlanTransactionPayload = {
        id: transaction.orderId,
        status:
          status === TransactionStatusEnum.COMPLETED
            ? UserPlanStatusEnum.COMPLETED
            : UserPlanStatusEnum.FAILURE,
      };

      await this.userService.sendUserPlanTransaction(payload);
    } else if (transaction.type === TransactionTypeEnum.ORDER) {
      const payload: IOrderTransactionPayload = {
        id: transaction.orderId,
        status:
          status === TransactionStatusEnum.COMPLETED
            ? OrderStatusEnum.COMPLETED
            : OrderStatusEnum.FAILURE,
      };

      await this.productService.sendOrderTransaction(payload);
    }

    // redirect request
    callbackUrl.searchParams.append('status', status.toString());
    return response.redirect(callbackUrl.href);
  }
}
