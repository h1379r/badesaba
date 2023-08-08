import { IsDefined, IsMongoId } from 'class-validator';

export class DeleteTokenDto {
  @IsDefined()
  @IsMongoId()
  id: string;
}
