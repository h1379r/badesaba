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
  CATEGORY_TITLE_LENGTH,
  CATEGORY_ICON_LENGTH,
} from '../constant/category-length.constant';

export class UpdateCategoryDto {
  @IsDefined()
  @IsMongoId()
  id: string;

  @IsOptional()
  @IsMongoId()
  parent?: string;

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
