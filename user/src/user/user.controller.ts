import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IUserPayload } from './interface/user-payload.interface';
import { GetUserPayload } from 'src/auth/decorator/get-user-payload.decorator';
import { LoginDto } from './dto/login.dto';
import { VerifyLoginDto } from './dto/verify-login.dto';
import { GetIp } from 'src/common/decorator/get-ip.decorator';
import { GetUserAgent } from 'src/common/decorator/get-user-agent.decorator';
import { LogoutDto } from './dto/logout.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserAuthGuard } from 'src/auth/guard/user-auth.guard';
import { ReCaptchaGuard } from 'src/captcha/guard/re-captcha.guard';
import { GetUserDto } from './dto/get-user.dto';
import { GetUsersListDto } from './dto/get-users-list.dto';
import { UserRoleEnum } from './enum/user-role.enum';
import { RequireRole } from 'src/authz/decorator/require-role.decorator';
import { AuthzGuard } from 'src/authz/authz.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PurchasePlanDto } from './dto/purchase-plan.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  getUser(@Query() getUserDto: GetUserDto) {
    return this.userService.getUser(getUserDto);
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard, AuthzGuard)
  @RequireRole(UserRoleEnum.ADMIN)
  getUsersList(@Query() getUsersListDto: GetUsersListDto) {
    return this.userService.getUsersList(getUsersListDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  getProfile(@GetUserPayload() userPayload: IUserPayload) {
    return this.userService.getProfile(userPayload);
  }

  @Get('plans')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  getUserPlans(@GetUserPayload() userPayload: IUserPayload) {
    return this.userService.getUserPlans(userPayload);
  }

  @Post('login')
  @UseGuards(ReCaptchaGuard)
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Post('login/verify')
  verifyLogin(
    @Body() verifyLoginDto: VerifyLoginDto,
    @GetIp() ip: string,
    @GetUserAgent() userAgent: string,
  ) {
    return this.userService.verifyLogin(verifyLoginDto, ip, userAgent);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.userService.updateProfile(updateProfileDto, userPayload);
  }

  @Post('plan')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  purchasePlan(
    @Body() purchasePlanDto: PurchasePlanDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.userService.purchasePlan(purchasePlanDto, userPayload);
  }

  @Delete('logout')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  logout(
    @Query() logoutDto: LogoutDto,
    @GetUserPayload() userPayload: IUserPayload,
  ) {
    return this.userService.logout(logoutDto, userPayload);
  }
}
