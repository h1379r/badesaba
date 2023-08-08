import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './token.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService, ConfigType } from '@nestjs/config';
import appEnvConfig from 'src/config/app-env.config';
import { ITokenLoginArgs } from './interface/token-login-args.interface';
import { randomUUID } from 'crypto';
import { parseDevice } from 'src/util/parse-device.util';
import { IUserPayload } from 'src/user/interface/user-payload.interface';
import { decrypt, encrypt } from 'src/util/encryption.util';
import { ITokenLogoutArgs } from './interface/token-logout-args.interface';
import { RefreshAccessTokenDto } from './dto/refresh-access-token.dto';
import { DeleteTokenDto } from './dto/delete-token.dto';
import { GetLoginHistoryDto } from './dto/get-login-history.dto';
import { GetActiveLoginsDto } from './dto/get-active-logins.dto';
import { Ip2locationService } from 'src/ip2location/ip2location.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private jwtService: JwtService,
    private ip2locationService: Ip2locationService,
    private configService: ConfigService<ConfigType<typeof appEnvConfig>>,
  ) {}

  async login(args: ITokenLoginArgs) {
    // create access token
    const accessTokenEnvConfig = this.configService.get('accessToken', {
      infer: true,
    });

    const userPayload: IUserPayload = {
      id: args.user.toHexString(),
      role: args.role,
    };

    const accessToken = await this.jwtService.signAsync(userPayload, {
      secret: accessTokenEnvConfig.secret,
      expiresIn: accessTokenEnvConfig.expiresIn,
    });

    // create refreh token
    const refreshTokenEnvConfig = this.configService.get('refreshToken', {
      infer: true,
    });

    const key = randomUUID();
    const device = parseDevice(args.userAgent);
    const expiresIn = new Date(
      Date.now() + refreshTokenEnvConfig.expiresIn * 1e3,
    );
    const location = await this.ip2locationService.getLocationByIp(args.ip);

    await this.tokenModel.create({
      user: args.user,
      key,
      ip: args.ip,
      userAgent: args.userAgent,
      location,
      device,
      expiresIn,
    });

    const refreshToken = (
      await encrypt(Buffer.from(key), refreshTokenEnvConfig.secret)
    ).toString('hex');

    return {
      expiresIn,
      accessToken,
      refreshToken,
    };
  }

  async logout(args: ITokenLogoutArgs) {
    const refreshTokenEnvConfig = this.configService.get('refreshToken', {
      infer: true,
    });

    // decrypt token key
    const key = (
      await decrypt(
        Buffer.from(args.refreshToken, 'hex'),
        refreshTokenEnvConfig.secret,
      )
    ).toString();

    // soft delete token
    await this.tokenModel.updateOne(
      {
        key,
        user: args.user,
        isActive: true,
      },
      { $set: { isActive: false, deletedAt: new Date() } },
    );

    return;
  }

  async getLoginHistory(
    getLoginHistoryDto: GetLoginHistoryDto,
    userPayload: IUserPayload,
  ) {
    const user = new Types.ObjectId(userPayload.id);

    // create filter
    const filter: FilterQuery<Token> = { user };

    // create result query
    const resultPromise = this.tokenModel
      .find(filter, {
        ip: 1,
        location: 1,
        device: 1,
        createdAt: 1,
      })
      .sort({ _id: -1 })
      .skip(getLoginHistoryDto.offset)
      .limit(getLoginHistoryDto.limit)
      .lean()
      .exec();

    // create total query
    const totalPromise = this.tokenModel.countDocuments(filter).exec();

    // wait for result and total queries
    const [result, total] = await Promise.all([resultPromise, totalPromise]);

    return { total, result };
  }

  async getActiveLogins(
    getActiveLoginsDto: GetActiveLoginsDto,
    userPayload: IUserPayload,
  ) {
    const user = new Types.ObjectId(userPayload.id);

    // create filter
    const filter: FilterQuery<Token> = {
      user,
      expiresIn: { $gt: new Date() },
      isActive: true,
    };

    // create result query
    const resultPromise = this.tokenModel
      .find(filter, {
        ip: 1,
        location: 1,
        device: 1,
        createdAt: 1,
      })
      .sort({ _id: -1 })
      .skip(getActiveLoginsDto.offset)
      .limit(getActiveLoginsDto.limit)
      .lean()
      .exec();

    // create total query
    const totalPromise = this.tokenModel.countDocuments(filter).exec();

    // wait for result and total queries
    const [result, total] = await Promise.all([resultPromise, totalPromise]);

    return { total, result };
  }

  async refreshAccessToken(refreshAccessTokenDto: RefreshAccessTokenDto) {
    const refreshTokenEnvConfig = this.configService.get('refreshToken', {
      infer: true,
    });

    // decrypt token key
    const key = (
      await decrypt(
        Buffer.from(refreshAccessTokenDto.refreshToken, 'hex'),
        refreshTokenEnvConfig.secret,
      )
    ).toString();

    // search for token
    const token = await this.tokenModel
      .findOne({ key, isActive: true }, { expiresIn: 1 })
      .populate('user', { role: 1 })
      .lean()
      .exec();

    // check token is exists
    if (token == null) {
      throw new UnauthorizedException();
    }

    // check token is not expired
    if (token.expiresIn.getTime() < Date.now()) {
      throw new UnauthorizedException();
    }

    // create access token
    const accessTokenEnvConfig = this.configService.get('accessToken', {
      infer: true,
    });

    const userPayload: IUserPayload = {
      id: token.user._id.toHexString(),
      role: token.user.role,
    };

    const accessToken = await this.jwtService.signAsync(userPayload, {
      secret: accessTokenEnvConfig.secret,
      expiresIn: accessTokenEnvConfig.expiresIn,
    });

    return { accessToken };
  }

  async deleteRefreshToken(
    deleteTokenDto: DeleteTokenDto,
    userPayload: IUserPayload,
  ) {
    const _id = new Types.ObjectId(deleteTokenDto.id);
    const user = new Types.ObjectId(userPayload.id);

    // soft delete token
    const deleteResult = await this.tokenModel.updateOne(
      {
        _id,
        user,
        isActive: true,
      },
      { $set: { isActive: false, deletedAt: new Date() } },
    );

    if (!deleteResult.matchedCount) {
      throw new BadRequestException('Not found token');
    }

    return { id: deleteTokenDto.id };
  }
}
