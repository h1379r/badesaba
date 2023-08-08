import { TransactionTypeEnum } from '../enum/transaction-type.enum';

export interface ICreateTransactionArgs {
  user: string;
  orderId: string;
  amount: number;
  type: TransactionTypeEnum;
  callbackUrl: string;
}
