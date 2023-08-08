import {
  IsDefined,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PLAN_TITLE_LENGTH } from '../constant/plan-length.constant';

export class UpdatePlanDto {
  @IsDefined()
  @IsMongoId()
  id: string;

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
