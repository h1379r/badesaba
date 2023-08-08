import { Transform } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import {
  MIN_OFFSET,
  DEFAULT_OFFSET,
  MIN_LIMIT,
  MAX_LIMIT,
  DEFAULT_LIMIT,
} from 'src/common/constant/pagination.constant';

export class GetLoginHistoryDto {
  @Transform((i) => (!i.value ? i.value : +i.value))
  @IsOptional()
  @IsInt()
  @Min(MIN_OFFSET)
  offset?: number = DEFAULT_OFFSET;

  @Transform((i) => (!i.value ? i.value : +i.value))
  @IsOptional()
  @IsInt()
  @Min(MIN_LIMIT)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT;
}
