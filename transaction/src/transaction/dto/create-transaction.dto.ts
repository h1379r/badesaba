import {
  IsDefined,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import {
  TRANSACTION_CALLBACK_URL_LENGTH,
  TRANSACTION_ORDER_ID_LENGTH,
} from '../constant/transaction-length.constant';
import { TransactionTypeEnum } from '../enum/transaction-type.enum';

export class CreateTransactionDto {
  @IsDefined()
  @IsMongoId()
  user: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(TRANSACTION_ORDER_ID_LENGTH)
  orderId: string;

  @IsDefined()
  @IsInt()
  @IsPositive()
  amount: number;

  @IsDefined()
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @IsDefined()
  @IsUrl()
  @MaxLength(TRANSACTION_CALLBACK_URL_LENGTH)
  callbackUrl: string;
}
