import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { Plan } from 'src/plan/plan.schema';
import { User } from 'src/user/user.schema';
import { UserPlanStatusEnum } from './enum/user-paln-status.enum';

export type UserPlanDocument = HydratedDocument<UserPlan>;

@Schema({ timestamps: true })
export class UserPlan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: PopulatedDoc<Types.ObjectId & User>;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  paln: PopulatedDoc<Types.ObjectId & Plan>;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  expiresIn: Date;

  @Prop({ default: UserPlanStatusEnum.PENDING })
  status?: UserPlanStatusEnum;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserPlanSchema = SchemaFactory.createForClass(UserPlan);
