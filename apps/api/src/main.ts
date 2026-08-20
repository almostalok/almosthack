import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { StructuredLoggerService } from './common/logger/structured-logger.service';
import { MetricsService } from './modules/metrics/metrics.service';

async function bootstrap() {
  const structuredLogger = new StructuredLoggerService('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: structuredLogger,
  });

  const configService = app.get(ConfigService);
  const metricsService = app.get(MetricsService);
  const port = configService.get<number>('port', 4000);
  const corsOrigin = configService.get<string>('corsOrigin', 'http://localhost:3000');
  const nodeEnv = configService.get<string>('nodeEnv', 'development');

  // Cookie Parser Middleware
  app.use(cookieParser());

  // Request ID Top-Level Middleware
  app.use(requestIdMiddleware);

  // Security Hardening (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  const allowedOrigins = corsOrigin.includes(',')
    ? corsOrigin.split(',').map((o) => o.trim())
    : corsOrigin;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
  });

  // Global Request Filters & Interceptors
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new LoggingInterceptor(structuredLogger, metricsService),
    new TransformInterceptor(reflector)
  );
  app.useGlobalFilters(new HttpExceptionFilter(structuredLogger, metricsService));

  // Global Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // API Base Path & URI Versioning (/api/v1)
  app.setGlobalPrefix('api', {
    exclude: [
      'health',
      'health/live',
      'health/ready',
      'health/liveness',
      'health/readiness',
      'health/version',
      'metrics',
      'metrics/prometheus',
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('almosthack Core API')
    .setDescription('The Transparent Hackathon Operating System API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-Request-ID', in: 'header' }, 'X-Request-ID')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Graceful Shutdown with Bounded Timeout
  app.enableShutdownHooks();

  const shutdownHandler = async (signal: string) => {
    structuredLogger.log(`Received ${signal}. Starting graceful shutdown with 10s timeout...`, 'Shutdown');
    const forceExitTimer = setTimeout(() => {
      structuredLogger.error('Graceful shutdown timed out after 10s. Forcing process exit.', undefined, 'Shutdown');
      process.exit(1);
    }, 10000);

    if (forceExitTimer.unref) {
      forceExitTimer.unref();
    }

    try {
      await app.close();
      structuredLogger.log('Application gracefully stopped.', 'Shutdown');
      process.exit(0);
    } catch (err: any) {
      structuredLogger.error(`Error during graceful shutdown: ${err.message}`, err.stack, 'Shutdown');
      process.exit(1);
    }
  };

  process.once('SIGTERM', () => shutdownHandler('SIGTERM'));
  process.once('SIGINT', () => shutdownHandler('SIGINT'));

  await app.listen(port);
  structuredLogger.log(`🚀 almosthack API engine running on port ${port} (env: ${nodeEnv})`, 'Bootstrap');
}

bootstrap();
