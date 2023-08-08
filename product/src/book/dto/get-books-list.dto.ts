import { Transform } from 'class-transformer';
import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsPositive,
  IsEnum,
} from 'class-validator';
import {
  MIN_OFFSET,
  DEFAULT_OFFSET,
  MIN_LIMIT,
  MAX_LIMIT,
  DEFAULT_LIMIT,
} from 'src/common/constant/pagination.constant';
import { BOOK_TITLE_LENGTH } from '../constant/book-length.constant';
import { BookSortType } from '../enum/book-sort-type.enum';

export class GetBooksListDto {
  @Transform((i) => (!i.value ? i.value : +i.value))
  @IsOptional()
  @IsEnum(BookSortType)
  sort?: BookSortType = BookSortType.NEWESTS;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOOK_TITLE_LENGTH)
  title?: string;

  @Transform((i) => (!i.value ? i.value : +i.value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  publishYear?: number;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsMongoId()
  author?: string;

  @IsOptional()
  @IsMongoId()
  publisher?: string;

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
