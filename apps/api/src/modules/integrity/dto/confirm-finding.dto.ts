import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ConfirmFindingDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Confirmation reason must be at least 5 characters' })
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
