export interface AppConfig {
  databaseUrl: string;
  redisUrl: string;
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  apiPrefix: string;
}

export default (): AppConfig => ({
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
});

