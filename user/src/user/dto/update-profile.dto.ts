import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { USER_NICKNAME_LENGTH } from '../constant/user-length.constant';

export class UpdateProfileDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(USER_NICKNAME_LENGTH)
  nickname: string;
}
