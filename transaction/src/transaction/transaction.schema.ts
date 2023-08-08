import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TransactionTypeEnum } from './enum/transaction-type.enum';
import { TransactionStatusEnum } from './enum/transaction-status.enum';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  trackId: string;

  @Prop({ required: true })
  type: TransactionTypeEnum;

  @Prop({ required: true })
  callbackUrl: string;

  @Prop({ default: TransactionStatusEnum.PENDING })
  status?: TransactionStatusEnum;

  @Prop()
  paidAt?: string;

  @Prop()
  cardNumber?: string;

  @Prop()
  paymentStatus?: number;

  @Prop()
  paymentStatusMessage?: string;

  @Prop()
  refNumber?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
