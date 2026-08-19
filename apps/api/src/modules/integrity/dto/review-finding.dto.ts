import { IsOptional, IsString } from 'class-validator';

export class ReviewFindingDto {
  @IsOptional()
  @IsString()
  notes?: string | null;
}
