import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  PUBLISHER_SLUG_LENGTH,
  PUBLISHER_TITLE_LENGTH,
} from '../constant/publisher-length.constant';

export class CreatePublisherDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PUBLISHER_SLUG_LENGTH)
  slug: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PUBLISHER_TITLE_LENGTH)
  title: string;
}
