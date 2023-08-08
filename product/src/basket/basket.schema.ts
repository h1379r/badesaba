import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { Book } from 'src/book/book.schema';

export type BasketDocument = HydratedDocument<Basket>;

@Schema({ timestamps: true })
export class Basket {
  @Prop({ required: true })
  user: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books: PopulatedDoc<Types.ObjectId & Book>[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const BasketSchema = SchemaFactory.createForClass(Basket);

BasketSchema.index({ user: 1 }, { unique: true });
