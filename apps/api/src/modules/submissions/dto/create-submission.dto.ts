import { IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { CreateSubmissionSchema } from '@almosthack/validation';

export class CreateSubmissionDto implements CreateSubmissionSchema {
  @IsNotEmpty()
  @IsString()
  title!: string;

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
