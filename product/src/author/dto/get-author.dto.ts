import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { AUTHOR_SLUG_LENGTH } from '../constant/author-length.constant';

export class GetAuthorDto {
  @ValidateIf((dto: GetAuthorDto) => dto.slug == null)
  @IsDefined()
  @IsMongoId()
  id: string;

  @ValidateIf((dto: GetAuthorDto) => dto.id == null)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AUTHOR_SLUG_LENGTH)
  slug: string;
}
