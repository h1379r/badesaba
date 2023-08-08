import { IsDefined, IsString, Matches } from 'class-validator';
import { REFRESH_TOKEN_REGEX } from 'src/token/constant/token-regex.constant';

export class LogoutDto {
  @IsDefined()
  @IsString()
  @Matches(REFRESH_TOKEN_REGEX)
  refreshToken: string;
}
