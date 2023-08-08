import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, PopulatedDoc, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parent?: PopulatedDoc<Types.ObjectId & Category>;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  icon?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
