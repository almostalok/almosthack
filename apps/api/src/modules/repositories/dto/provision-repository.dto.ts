import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class ProvisionRepositoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
