import { IsDefined, IsMongoId, IsUrl, MaxLength } from 'class-validator';
import { TRANSACTION_CALLBACK_URL_LENGTH } from 'src/transaction/constant/transaction-length.constant';

export class PurchasePlanDto {
  @IsDefined()
  @IsMongoId()
  plan: string;

  @IsDefined()
  @IsUrl()
  @MaxLength(TRANSACTION_CALLBACK_URL_LENGTH)
  callbackUrl: string;
}
