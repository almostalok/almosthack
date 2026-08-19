import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCriterionDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(100.0)
  maxScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
