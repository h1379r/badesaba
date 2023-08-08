import { OtpOperationTypeEnum } from '../enum/otp-operation-type.enum';
import { OtpTypeEnum } from '../enum/otp-type.enum';

export interface IVerifyOtpParams {
  code: string;
  id: string;
  type: OtpTypeEnum;
  operation: OtpOperationTypeEnum;
}
