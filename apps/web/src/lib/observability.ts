/**
 * Frontend lightweight observability and error reporting helper.
 */

export interface TelemetryEvent {
  event: string;
  category?: 'navigation' | 'interaction' | 'error' | 'security';
  properties?: Record<string, unknown>;
}

export function reportClientError(error: Error, componentStack?: string): void {
  // Safe client-side error reporting (no secrets, no tokens)
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Telemetry:ClientError]', error.message, componentStack);
  }
}

export function trackClientEvent(event: string, properties?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[Telemetry:Event]', event, properties);
  }
}
