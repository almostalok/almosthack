import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluationScoreInputDto {
  @IsNotEmpty()
  @IsUUID()
  criterionId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  score!: number;

  @IsOptional()
  @IsString()
  comment?: string | null;
}

export class SubmitEvaluationDto {
  @IsOptional()
  @IsString()
  generalFeedback?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationScoreInputDto)
  scores!: EvaluationScoreInputDto[];
}
