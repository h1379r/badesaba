import { IsDefined, IsInt, IsMongoId, Max, Min } from 'class-validator';

export class SetVoteDto {
  @IsDefined()
  @IsMongoId()
  book: string;

  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(5)
  score: number;
}
