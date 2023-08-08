import { OtpOperationTypeEnum } from '../enum/otp-operation-type.enum';
import { OtpTypeEnum } from '../enum/otp-type.enum';

export interface ICreateOtpParams {
  id: string;
  type: OtpTypeEnum;
  operation: OtpOperationTypeEnum;
  options?: {
    ttl?: number; // seconds
    timeout?: number; // seconds
  };
}
