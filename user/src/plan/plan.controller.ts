import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { DeletePlanDto } from './dto/delete-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UserRoleEnum } from 'src/user/enum/user-role.enum';
import { RequireRole } from 'src/authz/decorator/require-role.decorator';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { AuthzGuard } from 'src/authz/authz.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('plan')
@Controller('plan')
export class PlanController {
  constructor(private planService: PlanService) {}

  @Get('all')
  async getAllPlans() {
    return this.planService.getAllPlans();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  async createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.createPlan(createPlanDto);
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  async updatePlan(@Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.updatePlan(updatePlanDto);
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  async deletePlan(@Query() deletePlanDto: DeletePlanDto) {
    return this.planService.deletePlan(deletePlanDto);
  }
}
