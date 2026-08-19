import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsUUID()
  trackId?: string | null;

  @IsOptional()
  @IsUUID()
  challengeId?: string | null;

  @IsOptional()
  @IsUUID()
  repositoryId?: string | null;

  @IsOptional()
  @IsString()
  demoUrl?: string | null;

  @IsOptional()
  @IsString()
  documentationUrl?: string | null;
}
