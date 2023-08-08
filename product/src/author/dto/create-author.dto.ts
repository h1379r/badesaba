import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { AuthorTypeEnum } from '../enum/author-type.enum';
import {
  AUTHOR_SLUG_LENGTH,
  AUTHOR_FIRST_NAME_LENGTH,
  AUTHOR_LAST_NAME_LENGTH,
  AUTHOR_DESCRIPTION_LENGTH,
} from '../constant/author-length.constant';

export class CreateAuthorDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AUTHOR_SLUG_LENGTH)
  slug: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AUTHOR_FIRST_NAME_LENGTH)
  firstName: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AUTHOR_LAST_NAME_LENGTH)
  lastName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AUTHOR_DESCRIPTION_LENGTH)
  description?: string;

  @IsDefined()
  @IsEnum(AuthorTypeEnum)
  type: AuthorTypeEnum;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nationality?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  birthYear?: number;
}
