import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

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
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request as any).requestId || 'N/A';
    const nodeEnv = process.env.NODE_ENV || 'development';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal error occurred';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resPayload = exception.getResponse();

      // Pass Terminus health check responses untouched
      if (typeof resPayload === 'object' && resPayload !== null && 'status' in resPayload) {
        response.status(status).json(resPayload);
        return;
      }

      if (typeof resPayload === 'string') {
        message = resPayload;
      } else if (typeof resPayload === 'object' && resPayload !== null) {
        const payloadObj = resPayload as Record<string, any>;

        // Handle validation errors (NestJS default ValidationPipe returns array of messages)
        if (Array.isArray(payloadObj.message)) {
          code = 'VALIDATION_ERROR';
          message = payloadObj.message.join('; ');
          details = payloadObj.message;
        } else {
          message = payloadObj.message || exception.message;
          code = payloadObj.code || this.getErrorCodeFromStatus(status);
        }
      } else {
        message = exception.message;
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
        message = 'Database operation failed';
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'An unexpected error occurred';
    }

    // Log complete internal error details with requestId
    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - Status: ${status} - Error: ${
        exception instanceof Error ? exception.message : JSON.stringify(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined
    );

    // Suppress sensitive internal details in production
    const isProd = nodeEnv === 'production';
    const safeMessage = isProd && status === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'An unexpected error occurred'
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
