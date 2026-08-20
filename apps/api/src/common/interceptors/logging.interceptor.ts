import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { StructuredLoggerService } from '../logger/structured-logger.service';
import { MetricsService } from '../../modules/metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: StructuredLoggerService;

  constructor(
    @Optional() private readonly structuredLogger?: StructuredLoggerService,
    @Optional() private readonly metricsService?: MetricsService
  ) {
    this.logger = structuredLogger || new StructuredLoggerService('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const method = req.method;
    const path = req.originalUrl || req.url;
    const requestId = (req as any).requestId || 'N/A';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;

          // Track metric
          if (this.metricsService) {
            this.metricsService.recordHttpRequest(method, path, statusCode, duration);
          }

          this.logger.info(
            `${method} ${path} ${statusCode} +${duration}ms`,
            'HTTP',
            {
              requestId,
              method,
              path,
              statusCode,
              durationMs: duration,
            }
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || error.statusCode || 500;

          // Track metric
          if (this.metricsService) {
            this.metricsService.recordHttpRequest(method, path, statusCode, duration);
            this.metricsService.recordHttpError(method, path, error.name || 'Error');

            if (statusCode === 401) {
              this.metricsService.recordAuthFailure('HTTP_UNAUTHORIZED');
            } else if (statusCode === 403) {
              this.metricsService.recordAuthorizationFailure(path);
            }
          }

          this.logger.error(
            `${method} ${path} ${statusCode} +${duration}ms - ${error.message || 'Error'}`,
            error.stack,
            'HTTP',
            {
              requestId,
              method,
              path,
              statusCode,
              durationMs: duration,
              error: error.message,
            }
          );

          // Security events
          if (statusCode === 401) {
            this.logger.logSecurityEvent('AUTH_TOKEN_REJECTED', {
              requestId,
              ip: req.socket?.remoteAddress,
              resource: `${method} ${path}`,
              reason: error.message,
            });
          } else if (statusCode === 403) {
            this.logger.logSecurityEvent('AUTHORIZATION_DENIED', {
              requestId,
              ip: req.socket?.remoteAddress,
              resource: `${method} ${path}`,
              reason: error.message,
            });
          }
        },
      })
    );
  }
}
