import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { DeleteTokenDto } from './dto/delete-token.dto';
import { IUserPayload } from 'src/user/interface/user-payload.interface';
import { GetUserPayload } from 'src/auth/decorator/get-user-payload.decorator';
import { GetActiveLoginsDto } from './dto/get-active-logins.dto';
import { GetLoginHistoryDto } from './dto/get-login-history.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('token')
@Controller('token')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  getLoginHistory(
    @Query() getLoginHistoryDto: GetLoginHistoryDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.tokenService.getLoginHistory(getLoginHistoryDto, userPayload);
  }

  @Get('active')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  getActiveLogins(
    @Query() getActiveLoginsDto: GetActiveLoginsDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.tokenService.getActiveLogins(getActiveLoginsDto, userPayload);
  }

  @Post('refresh')
  refreshAccessToken(@Body() refreshAccessTokenDto: RefreshAccessTokenDto) {
    return this.tokenService.refreshAccessToken(refreshAccessTokenDto);
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  deleteRefreshToken(
    @Query() deleteTokenDto: DeleteTokenDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.tokenService.deleteRefreshToken(deleteTokenDto, userPayload);
  }
}
