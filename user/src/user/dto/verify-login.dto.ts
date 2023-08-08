import { IsDefined, Matches, IsString } from 'class-validator';
import { OTP_CODE_REGEX } from 'src/otp/constant/otp-regex.constant';
import { USER_MOBILE_REGEX } from '../constant/user-regex.constant';

export class VerifyLoginDto {
  @IsDefined()
  @IsString()
  @Matches(USER_MOBILE_REGEX)
  mobile: string;

  @IsDefined()
  @IsString()
  @Matches(OTP_CODE_REGEX)
  otpCode: string;
}
