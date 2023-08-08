import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PLAN_TITLE_LENGTH } from '../constant/plan-length.constant';

export class CreatePlanDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PLAN_TITLE_LENGTH)
  title: string;

  @IsDefined()
  @IsInt()
  @Min(1)
  days: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  beforeOffPrice?: number;

  @IsDefined()
  @IsInt()
  @Min(0)
  price: number;
}
