import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EnqueueTestJobDto {
  @ApiPropertyOptional({ example: 'hello infrastructure queue' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({ example: 'test-job-1' })
  @IsString()
  @IsOptional()
  jobId?: string;
}
