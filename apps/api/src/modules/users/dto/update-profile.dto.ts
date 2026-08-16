import {
  IsOptional,
  IsString,
  Length,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray,
  Matches,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Display name', example: 'Alok Kumar' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  @ApiPropertyOptional({ description: 'HTTPS Avatar URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @ValidateIf((o, value) => value !== null && value !== '')
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^https?:\/\//i, { message: 'Avatar URL must start with http:// or https://' })
  @Matches(/^(?!javascript:)/i, { message: 'javascript: URLs are strictly prohibited' })
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Short bio', example: 'Full-stack software engineer & hacker' })
  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string | null;

  @ApiPropertyOptional({ description: 'College / University name', example: 'IIT Bombay' })
  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(150, { message: 'College name cannot exceed 150 characters' })
  college?: string | null;

  @ApiPropertyOptional({ description: 'Branch / Field of study', example: 'Computer Science' })
  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(100, { message: 'Branch name cannot exceed 100 characters' })
  branch?: string | null;

  @ApiPropertyOptional({ description: 'Graduation year', example: 2026 })
  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @Type(() => Number)
  @IsInt({ message: 'Graduation year must be an integer' })
  @Min(1950, { message: 'Graduation year must be at or after 1950' })
  @Max(2100, { message: 'Graduation year must be at or before 2100' })
  graduationYear?: number | null;

  @ApiPropertyOptional({ description: 'Technical skills list', example: ['React', 'NestJS', 'PostgreSQL'] })
  @IsOptional()
  @IsArray({ message: 'Skills must be an array of strings' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  @MaxLength(50, { each: true, message: 'Individual skill length cannot exceed 50 characters' })
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return value;
    const cleaned: string[] = [];
    const seen = new Set<string>();
    for (const item of value) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed.length > 0) {
          const lower = trimmed.toLowerCase();
          if (!seen.has(lower)) {
            seen.add(lower);
            cleaned.push(trimmed);
          }
        }
      }
    }
    return cleaned.slice(0, 30);
  })
  skills?: string[];

  @ApiPropertyOptional({ description: 'GitHub Username metadata', example: 'octocat' })
  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, {
    message: 'Invalid GitHub username format',
  })
  githubUsername?: string | null;

  @ApiPropertyOptional({ description: 'LinkedIn Profile URL', example: 'https://linkedin.com/in/username' })
  @IsOptional()
  @ValidateIf((o, value) => value !== null && value !== '')
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^https?:\/\//i, { message: 'LinkedIn URL must start with http:// or https://' })
  @Matches(/^(?!javascript:)/i, { message: 'javascript: URLs are strictly prohibited' })
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedinUrl?: string | null;

  @ApiPropertyOptional({ description: 'Portfolio / Personal Website URL', example: 'https://alex.dev' })
  @IsOptional()
  @ValidateIf((o, value) => value !== null && value !== '')
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^https?:\/\//i, { message: 'Portfolio URL must start with http:// or https://' })
  @Matches(/^(?!javascript:)/i, { message: 'javascript: URLs are strictly prohibited' })
  @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
  portfolioUrl?: string | null;
}
