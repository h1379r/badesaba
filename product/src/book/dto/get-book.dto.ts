import { IsDefined, IsMongoId } from 'class-validator';

export class GetBookDto {
  @IsDefined()
  @IsMongoId()
  id: string;
}
