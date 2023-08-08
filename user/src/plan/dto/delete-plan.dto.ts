import { IsDefined, IsMongoId } from 'class-validator';

export class DeletePlanDto {
  @IsDefined()
  @IsMongoId()
  id: string;
}
