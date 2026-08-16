import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Starting almosthack Background Worker process...');

  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();

  logger.log('🚀 almosthack Background Worker running and listening for jobs...');
}

bootstrap();
