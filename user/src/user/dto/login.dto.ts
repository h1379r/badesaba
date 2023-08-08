import { IsDefined, IsString, Matches } from 'class-validator';
import { USER_MOBILE_REGEX } from '../constant/user-regex.constant';

export class LoginDto {
  @IsDefined()
  @IsString()
  @Matches(USER_MOBILE_REGEX)
  mobile: string;
}
