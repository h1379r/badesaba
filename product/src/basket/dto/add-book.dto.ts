import { IsDefined, IsMongoId } from 'class-validator';

export class AddBookDto {
  @IsDefined()
  @IsMongoId()
  book: string;
}
