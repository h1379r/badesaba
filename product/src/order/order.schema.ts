import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { Book } from 'src/book/book.schema';
import { OrderStatusEnum } from './enum/order-status.enum';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  user: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books: PopulatedDoc<Types.ObjectId & Book>;

  @Prop({ required: true })
  price: number;

  @Prop({ default: OrderStatusEnum.PENDING })
  status?: OrderStatusEnum;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
