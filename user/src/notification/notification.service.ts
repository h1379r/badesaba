import { Injectable, Logger } from '@nestjs/common';
import { NotificationTypeEnum } from './enum/notification-type.enum';
import { NotificationParams } from './interface/notification-params.interface';

@Injectable()
export class NotificationService {
  async sendOtpSms(
    mobile: string,
    type: NotificationTypeEnum,
    params: NotificationParams,
  ) {
    /**
     * TODO: implement notification strategy
     */

    Logger.debug(`mobile: ${mobile}, type: ${type}, ${JSON.stringify(params)}`);
  }
}
