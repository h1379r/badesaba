import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { Author } from 'src/author/author.schema';
import { Category } from 'src/category/category.schema';
import { Publisher } from 'src/publisher/publisher.schema';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  coverUrl: string;

  @Prop({ required: true })
  publishYear: number;

  @Prop()
  beforeOffPrice?: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  vip: boolean;

  @Prop({ default: 0 })
  rating?: number;

  @Prop({ default: 0 })
  votesCount?: number;

  @Prop({ default: 0 })
  salesCount?: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: PopulatedDoc<Types.ObjectId & Category>[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Author' }] })
  authors: PopulatedDoc<Types.ObjectId & Author>[];

  @Prop({ type: Types.ObjectId, ref: 'Publisher', required: true })
  publisher: PopulatedDoc<Types.ObjectId & Publisher>;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);

BookSchema.index({ title: 'text' });
