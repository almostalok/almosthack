export interface AppConfig {
  databaseUrl: string;
  redisUrl: string;
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  apiPrefix: string;
  logLevel: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}

export default (): AppConfig => ({
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
});
