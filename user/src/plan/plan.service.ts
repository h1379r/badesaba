import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Plan } from './plan.schema';
import { Model, Types } from 'mongoose';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { DeletePlanDto } from './dto/delete-plan.dto';

@Injectable()
export class PlanService {
  constructor(@InjectModel(Plan.name) private planModel: Model<Plan>) {}

  async getAllPlans() {
    const plans = await this.planModel
      .find(
        { isActive: true },
        { title: 1, days: 1, beforeOffPrice: 1, price: 1 },
      )
      .sort({ days: 1 })
      .lean()
      .exec();

    return plans;
  }

  async createPlan(createPlanDto: CreatePlanDto) {
    const insertPlanResult = await this.planModel.create({
      title: createPlanDto.title,
      days: createPlanDto.days,
      beforeOffPrice: createPlanDto.beforeOffPrice,
      price: createPlanDto.price,
    });

    return { id: insertPlanResult._id.toHexString() };
  }

  async updatePlan(updatePlanDto: UpdatePlanDto) {
    const _id = new Types.ObjectId(updatePlanDto.id);

    const plansCount = await this.planModel.countDocuments({ _id }).exec();

    // check that plan is exists
    if (!plansCount) {
      throw new BadRequestException('Not found plan');
    }

    // update plan
    await this.planModel.updateOne(
      { _id },
      {
        $set: {
          title: updatePlanDto.title,
          days: updatePlanDto.days,
          beforeOffPrice: updatePlanDto.beforeOffPrice,
          price: updatePlanDto.price,
        },
      },
    );

    return { id: updatePlanDto.id };
  }

  async deletePlan(deletePlanDto: DeletePlanDto) {
    const _id = new Types.ObjectId(deletePlanDto.id);

    const plansCount = await this.planModel.countDocuments({ _id }).exec();

    // check that plan is exists
    if (!plansCount) {
      throw new BadRequestException('Not found plan');
    }

    // soft delete plan
    await this.planModel.updateOne(
      { _id },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
        },
      },
    );

    return { id: deletePlanDto.id };
  }
}
