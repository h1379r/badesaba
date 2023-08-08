import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlanDocument = HydratedDocument<Plan>;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  days: number;

  @Prop()
  beforeOffPrice?: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
