import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  MIN_OFFSET,
  DEFAULT_OFFSET,
  MIN_LIMIT,
  MAX_LIMIT,
  DEFAULT_LIMIT,
} from 'src/common/constant/pagination.constant';

export class GetActiveLoginsDto {
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
