import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import {
  CATEGORY_SLUG_LENGTH,
  CATEGORY_TITLE_LENGTH,
  CATEGORY_ICON_LENGTH,
} from '../constant/category-length.constant';

export class CreateCategoryDto {
  @IsOptional()
  @IsMongoId()
  parent?: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CATEGORY_SLUG_LENGTH)
  slug: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CATEGORY_TITLE_LENGTH)
  title: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(CATEGORY_ICON_LENGTH)
  icon?: string;
}
