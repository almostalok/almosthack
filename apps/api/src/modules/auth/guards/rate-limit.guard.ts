import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly limits = new Map<string, RateLimitRecord>();
  private readonly maxRequests = 10; // Max 10 requests
  private readonly windowMs = 60 * 1000; // Per 1 minute window

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for'] ||
      request.socket?.remoteAddress ||
      '127.0.0.1';

    const key = `${ip}:${request.path}`;
    const now = Date.now();

    const record = this.limits.get(key);

    if (!record || now > record.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many authentication attempts. Please try again in 1 minute.',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    record.count += 1;
    return true;
  }
}
