import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const redisUrl = this.configService.get<string>('redisUrl', 'redis://localhost:6379');
    this.logger.log(`Worker Redis connecting to ${redisUrl.replace(/\/\/[^@]+@/, '//***@')}`);

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.logger.log('Worker Redis client connected successfully');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Worker Redis client error: ${err.message}`, err.stack);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.logger.log('Disconnecting Worker Redis client...');
      try {
        await this.client.quit();
        this.logger.log('Worker Redis client disconnected cleanly');
      } catch (err: any) {
        this.logger.warn(`Error during Worker Redis quit: ${err.message}`);
        this.client.disconnect();
      }
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }
}
