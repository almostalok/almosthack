import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class StartAnalysisDto {
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  similarityThreshold?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  minimumComparedLines?: number;
}
