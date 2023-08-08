import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PUBLISHER_SLUG_LENGTH } from '../constant/publisher-length.constant';

export class GetPublisherDto {
  @ValidateIf((dto: GetPublisherDto) => dto.slug == null)
  @IsDefined()
  @IsMongoId()
  id: string;

  @ValidateIf((dto: GetPublisherDto) => dto.id == null)
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PUBLISHER_SLUG_LENGTH)
  slug: string;
}
