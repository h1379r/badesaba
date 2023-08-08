import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { PUBLISHER_TITLE_LENGTH } from '../constant/publisher-length.constant';

export class UpdatePublisherDto {
  @IsDefined()
  @IsMongoId()
  id: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PUBLISHER_TITLE_LENGTH)
  title: string;
}
