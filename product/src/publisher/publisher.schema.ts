import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PublisherDocument = HydratedDocument<Publisher>;

@Schema({ timestamps: true })
export class Publisher {
  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher);
