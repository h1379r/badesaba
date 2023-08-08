import { Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import appEnvConfig from 'src/config/app-env.config';
import { IZibalRequestPaymentArgs } from './interface/zibal-request-payment-args.interface';
import { IZibalVerifyPaymentArgs } from './interface/zibal-verify-payment-args.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { concatUrl } from 'src/util/concat-url.util';

@Injectable()
export class ZibalService {
  private baseUrl: string;
  private merchant: string;

  constructor(
    configService: ConfigService<ConfigType<typeof appEnvConfig>>,
    private httpService: HttpService,
  ) {
    const zibalEnvConfig = configService.get('zibal', { infer: true });

    this.baseUrl = zibalEnvConfig.baseUrl;
    this.merchant = zibalEnvConfig.merchant;
  }

  async reqestPayment(args: IZibalRequestPaymentArgs) {
    const url = concatUrl(this.baseUrl, 'v1/request');

    const requestBody = {
      merchant: this.merchant,
      amount: args.amount * 10,
      callbackUrl: args.callbackUrl,
    };

    const res = await lastValueFrom(this.httpService.post(url, requestBody));

    if (res.data.result == 100) {
      return {
        success: true,
        message: this.getResultMessage(res.data.result),
        result: {
          trackId: res.data.trackId.toString() as string,
          url: this.getUrl(res.data.trackId),
        },
      };
    } else if (res.data.result == 105 || res.data.result == 113) {
      return {
        success: false,
        message: this.getResultMessage(res.data.result),
      };
    } else {
      throw new Error(this.getResultMessage(res.data.result));
    }
  }

  async veifyPayment(args: IZibalVerifyPaymentArgs) {
    const url = concatUrl(this.baseUrl, 'v1/verify');

    const requestBody = {
      merchant: this.merchant,
      trackId: args.trackId,
    };

    const res = await lastValueFrom(this.httpService.post(url, requestBody));

    switch (res.data.result) {
      case 100:
      case 201:
        return {
          success: true,
          message: this.getResultMessage(res.data.result),
          result: {
            paidAt: res.data.paidAt,
            cardNumber: res.data.cardNumber,
            status: res.data.status,
            statusMessage: this.getStatusMessage(res.data.status),
            refNumber: res.data.refNumber,
          },
        };
      case 202:
      case 203:
        return {
          success: false,
          message: this.getResultMessage(res.data.result),
          result: {
            paidAt: res.data.paidAt,
            cardNumber: res.data.cardNumber,
            status: res.data.status,
            statusMessage: this.getStatusMessage(res.data.status),
            refNumber: res.data.refNumber,
          },
        };
      default:
        throw new Error(this.getResultMessage(res.data.result));
    }
  }

  private getUrl(trakId: number) {
    return `${this.baseUrl}/start/${trakId}`;
  }

  private getResultMessage(result: number) {
    switch (result) {
      case 100:
        return 'با موفقیت تایید شد';
      case 102:
        return 'merchant یافت نشد';
      case 103:
        return 'merchant غیرفعال';
      case 104:
        return 'merchant نامعتبر';
      case 105:
        return 'مقدار بایستی بزرگتر از 1,000 ریال باشد';
      case 106:
        return 'callbackUrl نامعتبر می‌باشد (شروع با http و یا https)';
      case 113:
        return 'مبلغ تراکنش از سقف میزان تراکنش بیشتر است';
      case 201:
        return 'قبلا تایید شده';
      case 202:
        return 'سفارش پرداخت نشده یا ناموفق بوده است';
      case 203:
        return 'شناسه پیگیری نامعتبر می‌باشد';
      default:
        return null;
    }
  }

  private getStatusMessage(status: number) {
    switch (status) {
      case -1:
        return 'در انتظار پردخت';
      case -2:
        return 'خطای داخلی';
      case 1:
        return 'پرداخت شده - تاییدشده';
      case 2:
        return 'پرداخت شده - تاییدنشده';
      case 3:
        return 'لغوشده توسط کاربر';
      case 4:
        return 'شماره کارت نامعتبر می‌باشد';
      case 5:
        return 'موجودی حساب کافی نمی‌باشد';
      case 6:
        return 'رمز واردشده اشتباه می‌باشد';
      case 7:
        return '‌تعداد درخواست‌ها بیش از حد مجاز می‌باشد';
      case 8:
        return '‌تعداد پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد';
      case 9:
        return 'مبلغ پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد';
      case 10:
        return '‌صادرکننده‌ی کارت نامعتبر می‌باشد';
      case 11:
        return 'خطای سوییچ';
      case 12:
        return 'کارت قابل دسترسی نمی‌باشد';
      default:
        return null;
    }
  }
}
