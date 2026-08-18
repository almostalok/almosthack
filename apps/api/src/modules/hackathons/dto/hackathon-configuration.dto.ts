import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsArray,
  IsString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import {
  ParticipationMode,
  EligibilityType,
  AIUsagePolicy,
  PreExistingCodePolicy,
  OpenSourcePolicy,
  RepositoryPolicy,
} from '@almosthack/types';

export class UpdateHackathonConfigurationDto {
  @IsOptional()
  @IsEnum(ParticipationMode)
  participationMode?: ParticipationMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  minTeamSize?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxTeamSize?: number | null;

  @IsOptional()
  @IsEnum(EligibilityType)
  eligibilityType?: EligibilityType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedBranches?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedColleges?: string[];

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2200)
  graduationYearFrom?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2200)
  graduationYearTo?: number | null;

  @IsOptional()
  @IsEnum(AIUsagePolicy)
  aiUsagePolicy?: AIUsagePolicy;

  @IsOptional()
  @IsBoolean()
  aiDisclosureRequired?: boolean;

  @IsOptional()
  @IsEnum(PreExistingCodePolicy)
  preExistingCodePolicy?: PreExistingCodePolicy;

  @IsOptional()
  @IsEnum(OpenSourcePolicy)
  openSourcePolicy?: OpenSourcePolicy;

  @IsOptional()
  @IsBoolean()
  githubRequired?: boolean;

  @IsOptional()
  @IsEnum(RepositoryPolicy)
  repositoryPolicy?: RepositoryPolicy;
}

export class UpdateHackathonRulesDto {
  @IsOptional()
  @IsString()
  @MaxLength(100000)
  rulesMarkdown?: string | null;
}

