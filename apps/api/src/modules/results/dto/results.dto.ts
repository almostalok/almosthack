import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CalculateResultsDto {
  @IsOptional()
  @IsBoolean()
  forceRecalculate?: boolean;
}

export class ApproveResultsDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class PublishResultsDto {
  @IsOptional()
  @IsBoolean()
  notifyParticipants?: boolean;
}
