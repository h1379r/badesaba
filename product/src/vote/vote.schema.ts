import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { Book } from 'src/book/book.schema';

export type VoteDocument = HydratedDocument<Vote>;

@Schema({ timestamps: true })
export class Vote {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: PopulatedDoc<Types.ObjectId & Book>;

  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  score: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

VoteSchema.index({ book: 1, user: 1 }, { unique: true });
