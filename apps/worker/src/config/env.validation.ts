import { plainToInstance } from 'class-transformer';
import { IsEnum, IsOptional, IsString, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsString()
  @IsOptional()
  REDIS_URL: string = 'redis://localhost:6379';

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;
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
    throw new Error(`[WorkerConfigValidation] Invalid environment configuration: ${formattedErrors}`);
  }

  return validatedConfig;
}
