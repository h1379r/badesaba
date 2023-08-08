import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { User } from 'src/user/user.schema';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true  })
  user: PopulatedDoc<Types.ObjectId & User>;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  device: string;

  @Prop({ required: true })
  expiresIn: Date;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

TokenSchema.index(
  { key: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);
