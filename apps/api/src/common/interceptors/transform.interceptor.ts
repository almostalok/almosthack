import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_TRANSFORM_KEY } from '../decorators/bypass-transform.decorator';

export interface Response<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T> | T> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const bypass = this.reflector.getAllAndOverride<boolean>(BYPASS_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (bypass) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // If data is null/undefined
        if (data === undefined) {
          return { success: true, data: null };
        }
        // If data already has a success property (e.g., error shape or pre-formatted)
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        return {
          success: true,
          data,
        };
      })
    );
  }
}
