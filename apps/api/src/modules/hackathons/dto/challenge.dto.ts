import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChallengeStatus } from '@almosthack/types';

export class ChallengeResourceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title!: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  url!: string;
}

export class CreateChallengeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string | null;

  @IsString()
  @MinLength(5)
  @MaxLength(20000)
  problemStatement!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  requirements?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  constraints?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  expectedOutcome?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChallengeResourceDto)
  resources?: ChallengeResourceDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;
}

export class UpdateChallengeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20000)
  problemStatement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  requirements?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  constraints?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  expectedOutcome?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChallengeResourceDto)
  resources?: ChallengeResourceDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;
}

export class ReorderChallengesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}

export class ReorderItemDto {
  @IsUUID()
  id!: string;

  @IsInt()
  @Min(0)
  @Max(10000)
  displayOrder!: number;
}
