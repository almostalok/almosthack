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
    this.logger.log(`Initializing Redis client connecting to ${redisUrl.replace(/\/\/[^@]+@/, '//***@')}`);

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connected successfully');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis client error: ${err.message}`, err.stack);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.logger.log('Disconnecting Redis client...');
      try {
        await this.client.quit();
        this.logger.log('Redis client disconnected cleanly');
      } catch (err: any) {
        this.logger.warn(`Error during Redis quit, forcing disconnect: ${err.message}`);
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
