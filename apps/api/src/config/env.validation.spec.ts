import 'reflect-metadata';
import { validate, Environment } from './env.validation';

describe('Environment Validation (S7)', () => {
  it('should pass with valid development config', () => {
    const valid = {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/almosthack',
      NODE_ENV: Environment.Development,
      PORT: 4000,
    };

    const result = validate(valid);
    expect(result.DATABASE_URL).toBe(valid.DATABASE_URL);
    expect(result.NODE_ENV).toBe(Environment.Development);
  });

  it('should throw error when DATABASE_URL is missing', () => {
    const invalid = {
      NODE_ENV: Environment.Development,
    };

    expect(() => validate(invalid)).toThrow('[ConfigValidation] Invalid environment configuration');
  });

  it('should reject wildcard CORS in production environment', () => {
    const prodInvalid = {
      DATABASE_URL: 'postgresql://user:pass@db.internal:5432/almosthack',
      NODE_ENV: Environment.Production,
      CORS_ORIGIN: '*',
    };

    expect(() => validate(prodInvalid)).toThrow('Wildcard CORS origin (*) is forbidden in production environment');
  });

  it('should reject short JWT_SECRET in production environment', () => {
    const prodInvalid = {
      DATABASE_URL: 'postgresql://user:pass@db.internal:5432/almosthack',
      NODE_ENV: Environment.Production,
      JWT_SECRET: 'short',
      CORS_ORIGIN: 'https://almosthack.com',
    };

    expect(() => validate(prodInvalid)).toThrow('JWT_SECRET must be at least 16 characters in production environment');
  });
});
