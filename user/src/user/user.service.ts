import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model, Types } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { OtpTypeEnum } from 'src/otp/enum/otp-type.enum';
import { OtpOperationTypeEnum } from 'src/otp/enum/otp-operation-type.enum';
import { OtpService } from 'src/otp/otp.service';
import { VerifyLoginDto } from './dto/verify-login.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationTypeEnum } from 'src/notification/enum/notification-type.enum';
import { TokenService } from 'src/token/token.service';
import { UserRoleEnum } from './enum/user-role.enum';
import { LogoutDto } from './dto/logout.dto';
import { IUserPayload } from './interface/user-payload.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUserDto } from './dto/get-user.dto';
import { GetUsersListDto } from './dto/get-users-list.dto';
import { PurchasePlanDto } from './dto/purchase-plan.dto';
import { UserPlan } from 'src/user-plan/user-plan.schema';
import { Plan } from 'src/plan/plan.schema';
import { UserPlanStatusEnum } from 'src/user-plan/enum/user-paln-status.enum';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionTypeEnum } from 'src/transaction/enum/transaction-type.enum';
import { ConfigService, ConfigType } from '@nestjs/config';
import appEnvConfig from 'src/config/app-env.config';
import { Consumer, Kafka } from 'kafkajs';
import { KAFKA_CLIENT } from 'src/kafka/constant/kafka.constant';
import { IUserPlanTransactionPayload } from 'src/user-plan/interface/user-plan-transaction-payload.interface';
import { USER_PLAN_TRANSACTION_TOPIC } from 'src/user-plan/constant/user-plan.constant';

@Injectable()
export class UserService implements OnModuleInit, OnModuleDestroy {
  private transactionConsumer: Consumer;

  constructor(
    @Inject(KAFKA_CLIENT) private kafkaClient: Kafka,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Plan.name) private planModel: Model<Plan>,
    @InjectModel(UserPlan.name) private userPlanModel: Model<UserPlan>,
    private otpService: OtpService,
    private notificationService: NotificationService,
    private tokenService: TokenService,
    private transactionService: TransactionService,
    private configService: ConfigService<ConfigType<typeof appEnvConfig>>,
  ) {
    // create transaction consumer
    this.transactionConsumer = this.kafkaClient.consumer({
      groupId: 'user-transaction',
    });
  }

  async onModuleInit() {
    // insert super admin
    const superAdminMobile = this.configService.get('superAdmin', {
      infer: true,
    }).mobile;

    const usersCount = await this.userModel.countDocuments({}).exec();

    if (!usersCount) {
      await this.userModel.create({
        role: UserRoleEnum.SUPER_ADMIN,
        mobile: superAdminMobile,
      });
    }

    // consumer connect
    await this.transactionConsumer.connect();

    await this.consumeUserPlanTransactions();
  }

  async onModuleDestroy() {
    // disconnect consumer
    await this.transactionConsumer.disconnect();
  }

  async consumeUserPlanTransactions() {
    await this.transactionConsumer.subscribe({
      topic: USER_PLAN_TRANSACTION_TOPIC,
      fromBeginning: true,
    });

    await this.transactionConsumer.run({
      eachMessage: async ({ message }) => {
        const payload: IUserPlanTransactionPayload = JSON.parse(
          message.value.toString(),
        );

        await this.handleUserPlanTransaction(payload);
      },
    });
  }

  async getUser(getUserDto: GetUserDto) {
    const _id = new Types.ObjectId(getUserDto.id);

    const user = await this.userModel.findOne({ _id }).lean().exec();

    if (!user) {
      throw new BadRequestException('Not found user');
    }

    return user;
  }

  async getUsersList(getUsersListDto: GetUsersListDto) {
    // create result query
    const resultPromise = this.userModel
      .find({})
      .sort({ _id: -1 })
      .skip(getUsersListDto.offset)
      .limit(getUsersListDto.limit)
      .lean()
      .exec();

    // create total query
    const totalPromise = this.userModel.countDocuments({}).exec();

    // wait for result and total queries
    const [result, total] = await Promise.all([resultPromise, totalPromise]);

    return { total, result };
  }

  async getProfile(userPayload: IUserPayload) {
    const _id = new Types.ObjectId(userPayload.id);

    // search for user
    const user = await this.userModel
      .findOne(
        { _id },
        {
          role: 1,
          mobile: 1,
          nickname: 1,
        },
      )
      .lean()
      .exec();

    if (!user) {
      throw new BadRequestException('Not found user');
    }

    return user;
  }

  async getUserPlans(userPayload: IUserPayload) {
    const user = new Types.ObjectId(userPayload.id);

    const userPlans = await this.userPlanModel
      .find(
        {
          user,
          expiresIn: { $gte: new Date() },
          status: UserPlanStatusEnum.COMPLETED,
        },
        { expiresIn: 1 },
      )
      .sort({ expiresIn: 1 })
      .lean()
      .exec();

    return userPlans;
  }

  async login(loginDto: LoginDto) {
    // create otp
    const code = await this.otpService.createOtp({
      id: loginDto.mobile,
      type: OtpTypeEnum.SMS,
      operation: OtpOperationTypeEnum.LOGIN,
      options: { timeout: 60 },
    });

    // send otp
    await this.notificationService.sendOtpSms(
      loginDto.mobile,
      NotificationTypeEnum.VERIFY_LOGIN,
      { code },
    );

    return { mobile: loginDto.mobile };
  }

  async verifyLogin(
    verifyLoginDto: VerifyLoginDto,
    ip: string,
    userAgent: string,
  ) {
    // verify otp
    await this.otpService.verifyOtp({
      code: verifyLoginDto.otpCode,
      id: verifyLoginDto.mobile,
      type: OtpTypeEnum.SMS,
      operation: OtpOperationTypeEnum.LOGIN,
    });

    // search for user
    const user = await this.userModel
      .findOne({ mobile: verifyLoginDto.mobile }, { role: 1 })
      .lean()
      .exec();

    let _id: Types.ObjectId;
    let role: UserRoleEnum;

    // create user if not exists
    if (!user) {
      const insertUserResult = await this.userModel.create({
        role: UserRoleEnum.USER,
        mobile: verifyLoginDto.mobile,
      });

      _id = insertUserResult._id;
      role = UserRoleEnum.USER;
    } else {
      _id = user._id;
      role = user.role;
    }

    // create token
    const token = await this.tokenService.login({
      user: _id,
      role,
      ip,
      userAgent,
    });

    return token;
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    userPayload: IUserPayload,
  ) {
    const _id = new Types.ObjectId(userPayload.id);

    const updateUserResult = await this.userModel.updateOne(
      { _id },
      { $set: { nickname: updateProfileDto.nickname } },
    );

    if (!updateUserResult.matchedCount) {
      throw new BadRequestException('Not found user');
    }

    return { id: userPayload.id };
  }

  async purchasePlan(
    purchasePlanDto: PurchasePlanDto,
    userPayload: IUserPayload,
  ) {
    const plan = await this.planModel
      .findOne(
        { _id: new Types.ObjectId(purchasePlanDto.plan) },
        { days: 1, price: 1 },
      )
      .lean()
      .exec();

    // check that entered plan is exists
    if (!plan) {
      throw new BadRequestException('Not found plan');
    }

    const user = new Types.ObjectId(userPayload.id);

    // create user plan
    const insertUserPlanResult = await this.userPlanModel.create({
      user,
      paln: plan._id,
      price: plan.price,
      expiresIn: new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000),
    });

    const userPlan = insertUserPlanResult._id;

    // create transaction
    const transaction = await this.transactionService.createTransaction(
      {
        user: userPayload.id,
        orderId: userPlan.toHexString(),
        amount: plan.price,
        type: TransactionTypeEnum.PLAN,
        callbackUrl: purchasePlanDto.callbackUrl,
      },
      3,
    );

    // reject user plan if transaction is not successful
    if (!transaction.success) {
      await this.userPlanModel.updateOne(
        { _id: userPlan },
        { $set: { status: UserPlanStatusEnum.FAILURE } },
      );

      throw new BadRequestException(transaction.message);
    }

    return { id: userPlan.toHexString(), paymentUrl: transaction.result.url };
  }

  private async handleUserPlanTransaction(
    payload: IUserPlanTransactionPayload,
  ) {
    const userPlan = new Types.ObjectId(payload.id);

    // update user plan status
    await this.userPlanModel.updateOne(
      { _id: userPlan },
      { $set: { status: payload.status } },
    );
  }

  async logout(logoutDto: LogoutDto, userPayload: IUserPayload) {
    const _id = new Types.ObjectId(userPayload.id);

    await this.tokenService.logout({
      refreshToken: logoutDto.refreshToken,
      user: _id,
    });

    return {};
  }
}
