import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsNotEmpty({ message: 'DATABASE_URL environment variable is required' })
  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_URL: string = 'redis://localhost:6379';

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = 'info';

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX: number = 60;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_WINDOW_MS: number = 60000;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  SESSION_SECRET?: string;

  @IsString()
  @IsOptional()
  GIT_COMMIT_SHA?: string;

  @IsString()
  @IsOptional()
  APP_VERSION?: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = errors
      .map((err) => Object.values(err.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`[ConfigValidation] Invalid environment configuration: ${formattedErrors}`);
  }

  // Strict production assertions
  if (validatedConfig.NODE_ENV === Environment.Production) {
    if (validatedConfig.CORS_ORIGIN.includes('*')) {
      throw new Error('[ConfigValidation] Wildcard CORS origin (*) is forbidden in production environment');
    }
    if (validatedConfig.JWT_SECRET && validatedConfig.JWT_SECRET.length < 16) {
      throw new Error('[ConfigValidation] JWT_SECRET must be at least 16 characters in production environment');
    }
    if (validatedConfig.SESSION_SECRET && validatedConfig.SESSION_SECRET.length < 16) {
      throw new Error('[ConfigValidation] SESSION_SECRET must be at least 16 characters in production environment');
    }
  }

  return validatedConfig;
}
