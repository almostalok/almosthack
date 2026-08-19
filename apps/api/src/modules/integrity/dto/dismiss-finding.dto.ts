import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class DismissFindingDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Dismissal reason must be at least 5 characters' })
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
