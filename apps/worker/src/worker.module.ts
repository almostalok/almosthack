import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { RedisModule } from './infrastructure/redis/redis.module';
import { InfrastructureTestProcessor } from './queues/infrastructure-test/infrastructure-test.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    RedisModule,
  ],
  providers: [InfrastructureTestProcessor],
})
export class WorkerModule {}
