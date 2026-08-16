import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 4000);
  const corsOrigin = configService.get<string>('corsOrigin', 'http://localhost:3000');

  // Request ID Top-Level Middleware
  app.use(requestIdMiddleware);

  // Security Hardening
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = corsOrigin.includes(',')
    ? corsOrigin.split(',').map((o) => o.trim())
    : corsOrigin;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Global Request Filters & Interceptors
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor(reflector));
  app.useGlobalFilters(new HttpExceptionFilter());

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
    exclude: ['health/liveness', 'health/readiness'],
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

  // Graceful Shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`🚀 almosthack API engine running on http://localhost:${port}`);
  console.log(`📚 OpenAPI Docs available on http://localhost:${port}/docs`);
}

bootstrap();
