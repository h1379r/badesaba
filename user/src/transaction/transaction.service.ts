import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import appEnvConfig from 'src/config/app-env.config';
import { ICreateTransactionArgs } from './interface/create-transaction-args.interface';
import { concatUrl } from 'src/util/concat-url.util';
import { lastValueFrom } from 'rxjs';
import { ICreateTransactionData } from './interface/create-transaction-data.interface';
import { retryRequest } from 'src/util/retry-request.util';

@Injectable()
export class TransactionService {
  private baseUrl: string;
  private iscSecret: string;

  constructor(
    private httpService: HttpService,
    configService: ConfigService<ConfigType<typeof appEnvConfig>>,
  ) {
    this.baseUrl = configService.get('transaction', { infer: true }).baseUrl;
    this.iscSecret = configService.get('isc', { infer: true }).secret;
  }

  private async _createTransaction(args: ICreateTransactionArgs) {
    const url = concatUrl(this.baseUrl, 'v1/transaction');

    const requestBody = {
      user: args.user,
      orderId: args.orderId,
      amount: args.amount,
      type: args.type,
      callbackUrl: args.callbackUrl,
    };

    const headers = { authorization: this.iscSecret };

    const res = await lastValueFrom(
      this.httpService.post<ICreateTransactionData>(url, requestBody, {
        headers,
      }),
    );

    return res.data;
  }

  async createTransaction(
    args: ICreateTransactionArgs,
    retries?: number,
    backoff?: number,
  ) {
    return retryRequest<ReturnType<typeof this._createTransaction>>(
      this._createTransaction.bind(this, args),
      retries,
      backoff,
    );
  }
}
