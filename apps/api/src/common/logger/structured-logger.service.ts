import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { redactSensitiveData } from './redaction.util';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLogPayload {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: string;
  context?: string;
  requestId?: string;
  message: string;
  durationMs?: number;
  statusCode?: number;
  method?: string;
  path?: string;
  error?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}

export type SecurityEventType =
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_TOKEN_REJECTED'
  | 'AUTHORIZATION_DENIED'
  | 'RATE_LIMIT_TRIGGERED'
  | 'SUSPICIOUS_REQUEST';

export interface SecurityEventDetails {
  requestId?: string;
  userId?: string;
  ip?: string;
  resource?: string;
  action?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

@Injectable({ scope: Scope.DEFAULT })
export class StructuredLoggerService implements LoggerService {
  private readonly serviceName = 'almosthack-api';
  private readonly environment: string;
  private readonly configuredLogLevel: LogLevel;

  private readonly levelWeights: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };

  constructor(_context?: string) {
    this.environment = process.env.NODE_ENV || 'development';
    this.configuredLogLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const currentWeight = this.levelWeights[level] || 20;
    const thresholdWeight = this.levelWeights[this.configuredLogLevel] || 20;
    return currentWeight >= thresholdWeight;
  }

  private formatMessage(level: LogLevel, message: unknown, context?: string, metadata?: Record<string, unknown>, stack?: string): string {
    const safeMetadata = metadata ? redactSensitiveData(metadata) : undefined;
    const msgString = typeof message === 'object' ? JSON.stringify(redactSensitiveData(message)) : String(message);

    const logPayload: StructuredLogPayload = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      environment: this.environment,
      context: context || 'Application',
      message: msgString,
      metadata: safeMetadata,
      stack: stack && this.environment !== 'production' ? stack : undefined,
    };

    return JSON.stringify(logPayload);
  }

  log(message: any, context?: string) {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, context));
  }

  info(message: any, context?: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, context, metadata));
  }

  error(message: any, stack?: string, context?: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, context, metadata, stack));
  }

  warn(message: any, context?: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context, metadata));
  }

  debug(message: any, context?: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context, metadata));
  }

  verbose(message: any, context?: string) {
    if (!this.shouldLog('debug')) return;
    console.log(this.formatMessage('debug', message, context));
  }

  /**
   * Dedicated structured security audit event logging.
   */
  logSecurityEvent(event: SecurityEventType, details: SecurityEventDetails) {
    const safeDetails = redactSensitiveData(details) as SecurityEventDetails;
    const payload = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      service: this.serviceName,
      environment: this.environment,
      context: 'Security',
      securityEvent: event,
      requestId: safeDetails.requestId || 'N/A',
      ip: safeDetails.ip || 'N/A',
      userId: safeDetails.userId || 'anonymous',
      resource: safeDetails.resource,
      action: safeDetails.action,
      reason: safeDetails.reason,
      metadata: safeDetails.metadata,
    };

    console.warn(JSON.stringify(payload));
  }
}
