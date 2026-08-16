export interface WorkerConfig {
  redisUrl: string;
  nodeEnv: string;
}

export default (): WorkerConfig => ({
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV || 'development',
});
