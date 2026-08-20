import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';
import { MetricsService } from '../../modules/metrics/metrics.service';
import { StructuredLoggerService } from '../logger/structured-logger.service';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limits = new Map<string, RateLimitRecord>();
  private readonly defaultMax = 60; // 60 requests
  private readonly defaultWindowMs = 60 * 1000; // per 1 minute

  constructor(
    private readonly reflector: Reflector,
    @Optional() private readonly metricsService?: MetricsService,
    @Optional() private readonly logger?: StructuredLoggerService
  ) {
    // Periodic cleanup of expired records every 5 minutes to prevent memory leak
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.limits.entries()) {
        if (now > record.resetTime) {
          this.limits.delete(key);
        }
      }
    }, 5 * 60 * 1000);

    if (interval.unref) {
      interval.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const max = options?.max ?? this.defaultMax;
    const windowMs = options?.windowMs ?? this.defaultWindowMs;

    const rawForwarded = request.headers['x-forwarded-for'];
    const ip = typeof rawForwarded === 'string'
      ? rawForwarded.split(',')[0].trim()
      : (request.socket?.remoteAddress || '127.0.0.1');

    const path = request.route?.path || request.path || '/';
    const key = `${ip}:${request.method}:${path}`;
    const now = Date.now();

    const record = this.limits.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      this.limits.set(key, { count: 1, resetTime });

      response.setHeader('X-RateLimit-Limit', max);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, max - 1));
      response.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
      return true;
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

      response.setHeader('X-RateLimit-Limit', max);
      response.setHeader('X-RateLimit-Remaining', 0);
      response.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
      response.setHeader('Retry-After', retryAfterSeconds);

      // Track metric
      if (this.metricsService) {
        this.metricsService.recordRateLimitRejection();
      }

      // Security log
      if (this.logger) {
        this.logger.logSecurityEvent('RATE_LIMIT_TRIGGERED', {
          requestId: (request as any).requestId,
          ip,
          resource: `${request.method} ${path}`,
          action: 'RATE_LIMIT_BLOCK',
          reason: `Exceeded ${max} requests per ${windowMs}ms`,
        });
      }

      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: `Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
            requestId: (request as any).requestId || 'N/A',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    record.count += 1;
    response.setHeader('X-RateLimit-Limit', max);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    response.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    return true;
  }
}
