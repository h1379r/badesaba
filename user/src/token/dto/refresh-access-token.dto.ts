import { IsDefined, IsString, Matches } from 'class-validator';
import { REFRESH_TOKEN_REGEX } from '../constant/token-regex.constant';

export class RefreshAccessTokenDto {
  @IsDefined()
  @IsString()
  @Matches(REFRESH_TOKEN_REGEX)
  refreshToken: string;
}
