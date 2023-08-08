import { IsDefined, IsMongoId } from 'class-validator';

export class RemoveBookDto {
  @IsDefined()
  @IsMongoId()
  book: string;
}
