import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StructuredLoggerService } from '../logger/structured-logger.service';
import { MetricsService } from '../../modules/metrics/metrics.service';

export interface StandardErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: any;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: StructuredLoggerService;

  constructor(
    @Optional() private readonly structuredLogger?: StructuredLoggerService,
    @Optional() private readonly metricsService?: MetricsService
  ) {
    this.logger = structuredLogger || new StructuredLoggerService(HttpExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request as any).requestId || (request.headers?.['x-request-id'] as string) || 'N/A';
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProd = nodeEnv === 'production';

    // Ensure X-Request-ID response header is set
    if (requestId !== 'N/A' && !response.getHeader('x-request-id')) {
      response.setHeader('X-Request-ID', requestId);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal error occurred';
    let details: any = undefined;

    const isHttpException =
      exception instanceof HttpException ||
      (typeof exception === 'object' &&
        exception !== null &&
        'getStatus' in exception &&
        typeof (exception as any).getStatus === 'function');

    if (isHttpException) {
      const httpEx = exception as HttpException;
      status = httpEx.getStatus();
      const resPayload = httpEx.getResponse();

      // Pass Terminus health check responses untouched
      if (typeof resPayload === 'object' && resPayload !== null && 'status' in resPayload) {
        response.status(status).json(resPayload);
        return;
      }

      if (typeof resPayload === 'string') {
        message = resPayload;
        code = this.getErrorCodeFromStatus(status);
      } else if (typeof resPayload === 'object' && resPayload !== null) {
        const payloadObj = resPayload as Record<string, any>;

        if (Array.isArray(payloadObj.message)) {
          code = 'VALIDATION_ERROR';
          message = payloadObj.message.join('; ');
          details = payloadObj.message;
        } else if (payloadObj.error && typeof payloadObj.error === 'object') {
          code = payloadObj.error.code || payloadObj.code || this.getErrorCodeFromStatus(status);
          message = payloadObj.error.message || payloadObj.message || (exception as any).message;
          details = payloadObj.error.details || payloadObj.details;
        } else {
          message = payloadObj.message || (exception as any).message;
          code = payloadObj.code || this.getErrorCodeFromStatus(status);
          details = payloadObj.details;
        }
      } else {
        message = (exception as any).message;
        code = this.getErrorCodeFromStatus(status);
      }
    } else if (this.isPrismaError(exception)) {
      const prismaErr = exception as any;
      if (prismaErr.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'RESOURCE_ALREADY_EXISTS';
        message = 'A record with this unique attribute already exists';
      } else if (prismaErr.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'RESOURCE_NOT_FOUND';
        message = 'The requested record was not found';
      } else {
        status = HttpStatus.BAD_REQUEST;
        code = 'DATABASE_ERROR';
        message = isProd ? 'Database operation failed' : (prismaErr.message || 'Database operation failed');
      }
    } else if (exception instanceof Error) {
      if (exception.name === 'ZodError' || (exception as any).constructor?.name === 'ZodError') {
        status = HttpStatus.BAD_REQUEST;
        code = 'VALIDATION_ERROR';
        const issues = (exception as any).issues;
        message = Array.isArray(issues) ? issues.map((i: any) => i.message).join('; ') : exception.message;
        details = issues;
      } else {
        message = isProd && status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'An unexpected internal error occurred'
          : exception.message || 'An unexpected error occurred';
        code = this.getErrorCodeFromStatus(status);
      }
    }

    // Record metric for errors
    if (this.metricsService) {
      this.metricsService.recordHttpError(request.method, request.url, code);
      if (status === HttpStatus.UNAUTHORIZED) {
        this.metricsService.recordAuthFailure('HTTP_UNAUTHORIZED');
      } else if (status === HttpStatus.FORBIDDEN) {
        this.metricsService.recordAuthorizationFailure(request.url);
      }
    }

    // Log structured internal error
    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - Status: ${status} - Error: ${
        exception instanceof Error ? exception.message : JSON.stringify(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined,
      'HttpExceptionFilter',
      {
        requestId,
        method: request.method,
        path: request.url,
        statusCode: status,
        errorCode: code,
      }
    );

    // Suppress sensitive internal details in production for 500s
    const safeMessage = isProd && status === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'An unexpected internal error occurred'
      : message;

    const errorBody: StandardErrorResponse = {
      success: false,
      error: {
        code,
        message: safeMessage,
        requestId,
        ...(details && !isProd ? { details } : {}),
      },
    };

    response.status(status).json(errorBody);
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    );
  }
}
