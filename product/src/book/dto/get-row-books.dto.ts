import { IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { BookSortType } from '../enum/book-sort-type.enum';
import { Transform } from 'class-transformer';

export class GetRowBooksDto {
  @Transform((i) => (!i.value ? i.value : +i.value))
  @IsOptional()
  @IsEnum(BookSortType)
  sort?: BookSortType = BookSortType.NEWESTS;

  @IsOptional()
  @IsMongoId()
  category?: string;

  @IsOptional()
  @IsMongoId()
  author?: string;

  @IsOptional()
  @IsMongoId()
  publisher?: string;
}
