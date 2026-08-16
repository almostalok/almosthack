import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingHeader = req.headers[REQUEST_ID_HEADER] || req.headers['x-request-id'];
  let requestId: string;

  if (incomingHeader && typeof incomingHeader === 'string' && incomingHeader.trim().length > 0) {
    requestId = incomingHeader.trim().slice(0, 128);
  } else {
    requestId = randomUUID();
  }

  (req as Record<string, any>).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    requestIdMiddleware(req, res, next);
  }
}
