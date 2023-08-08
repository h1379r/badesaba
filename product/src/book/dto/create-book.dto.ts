import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import {
  BOOK_TITLE_LENGTH,
  BOOK_COVER_URL_LENGTH,
  BOOK_DESCRIPTION_LENGTH,
} from '../constant/book-length.constant';

export class CreateBookDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOOK_TITLE_LENGTH)
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOOK_DESCRIPTION_LENGTH)
  description?: string;

  @IsDefined()
  @IsUrl()
  @MaxLength(BOOK_COVER_URL_LENGTH)
  coverUrl: string;

  @IsDefined()
  @IsInt()
  @IsPositive()
  publishYear: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  beforeOffPrice?: number;

  @IsDefined()
  @IsInt()
  @Min(0)
  price: number;

  @IsDefined()
  @IsBoolean()
  vip: boolean;

  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  categories: string[];

  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  authors: string[];

  @IsDefined()
  @IsMongoId()
  publisher: string;
}
