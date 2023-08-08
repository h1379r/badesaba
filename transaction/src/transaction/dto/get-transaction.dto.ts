import { IsDefined, IsMongoId } from 'class-validator';

export class GetTransactionDto {
  @IsDefined()
  @IsMongoId()
  id: string;
}
