import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPlan, UserPlanSchema } from './user-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPlan.name, schema: UserPlanSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class UserPlanModule {}
