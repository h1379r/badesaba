import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CATEGORY_SLUG_LENGTH } from '../constant/category-length.constant';

export class GetCategoryDto {
  @ValidateIf((dto: GetCategoryDto) => dto.slug == null)
  @IsDefined()
  @IsMongoId()
  id: string;

  @ValidateIf((dto: GetCategoryDto) => dto.id == null)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(CATEGORY_SLUG_LENGTH)
  slug: string;
}
