import { IsDefined, IsMongoId } from 'class-validator';

export class GetUserDto {
  @IsDefined()
  @IsMongoId()
  id: string;
}
