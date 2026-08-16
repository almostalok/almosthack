import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

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

          const logPayload = {
            timestamp: new Date().toISOString(),
            level: 'info',
            requestId,
            method,
            path,
            statusCode,
            duration: `${duration}ms`,
            context: 'HTTP',
          };

          this.logger.log(JSON.stringify(logPayload));
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || error.statusCode || 500;

          const logPayload = {
            timestamp: new Date().toISOString(),
            level: 'error',
            requestId,
            method,
            path,
            statusCode,
            duration: `${duration}ms`,
            error: error.message || 'Internal Server Error',
            context: 'HTTP',
          };

          this.logger.error(JSON.stringify(logPayload), error.stack);
        },
      })
    );
  }
}
