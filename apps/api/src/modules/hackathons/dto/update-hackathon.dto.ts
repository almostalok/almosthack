import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateHackathonDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsDateString()
  registrationStartsAt?: string;

  @IsOptional()
  @IsDateString()
  registrationEndsAt?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
