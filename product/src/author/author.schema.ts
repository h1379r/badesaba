import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AuthorTypeEnum } from './enum/author-type.enum';

export type AuthorDocument = HydratedDocument<Author>;

@Schema({ timestamps: true })
export class Author {
  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  type: AuthorTypeEnum;

  @Prop()
  nationality?: string;

  @Prop()
  birthYear?: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

AuthorSchema.index({ slug: 1 }, { unique: true });
