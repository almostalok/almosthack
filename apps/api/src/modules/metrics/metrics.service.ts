import { Injectable } from '@nestjs/common';

export interface RouteLatencyStats {
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
}

@Injectable()
export class MetricsService {
  private readonly httpRequests = new Map<string, number>();
  private readonly httpLatency = new Map<string, { count: number; totalMs: number; minMs: number; maxMs: number }>();
  private readonly httpErrors = new Map<string, number>();
  private readonly authFailures = new Map<string, number>();
  private readonly authorizationFailures = new Map<string, number>();
  private rateLimitRejections = 0;
  private readonly backgroundJobs = new Map<string, number>();
  private readonly startTime = Date.now();

  /**
   * Safe route normalizer to prevent high cardinality label explosion in metrics.
   * Converts `/api/v1/hackathons/550e8400-e29b-41d4-a716-446655440000/announcements` -> `/api/v1/hackathons/:id/announcements`
   */
  public normalizeRoute(url: string): string {
    if (!url) return '/';
    // Strip query string
    const cleanUrl = url.split('?')[0];

    return cleanUrl
      // Replace standard UUIDs
      .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, ':id')
      // Replace numeric IDs at path boundaries
      .replace(/\/(\d+)(\/|$)/g, '/:id$2');
  }

  public getStatusClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '2xx';
    if (statusCode >= 300 && statusCode < 400) return '3xx';
    if (statusCode >= 400 && statusCode < 500) return '4xx';
    if (statusCode >= 500) return '5xx';
    return 'other';
  }

  public recordHttpRequest(method: string, rawRoute: string, statusCode: number, durationMs: number): void {
    const route = this.normalizeRoute(rawRoute);
    const statusClass = this.getStatusClass(statusCode);
    const reqKey = `${method.toUpperCase()} ${route} ${statusClass}`;

    this.httpRequests.set(reqKey, (this.httpRequests.get(reqKey) || 0) + 1);

    // Latency
    const latKey = `${method.toUpperCase()} ${route}`;
    const currentLat = this.httpLatency.get(latKey) || { count: 0, totalMs: 0, minMs: Infinity, maxMs: 0 };
    this.httpLatency.set(latKey, {
      count: currentLat.count + 1,
      totalMs: currentLat.totalMs + durationMs,
      minMs: Math.min(currentLat.minMs, durationMs),
      maxMs: Math.max(currentLat.maxMs, durationMs),
    });
  }

  public recordHttpError(method: string, rawRoute: string, errorCode: string): void {
    const route = this.normalizeRoute(rawRoute);
    const errKey = `${method.toUpperCase()} ${route} ${errorCode}`;
    this.httpErrors.set(errKey, (this.httpErrors.get(errKey) || 0) + 1);
  }

  public recordAuthFailure(type: string): void {
    this.authFailures.set(type, (this.authFailures.get(type) || 0) + 1);
  }

  public recordAuthorizationFailure(resource: string): void {
    this.authorizationFailures.set(resource, (this.authorizationFailures.get(resource) || 0) + 1);
  }

  public recordRateLimitRejection(): void {
    this.rateLimitRejections += 1;
  }

  public recordBackgroundJob(queue: string, status: 'success' | 'failed' | 'retrying'): void {
    const key = `${queue} ${status}`;
    this.backgroundJobs.set(key, (this.backgroundJobs.get(key) || 0) + 1);
  }

  public getMetricsSummary() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const memory = process.memoryUsage();

    const latencyStats: Record<string, RouteLatencyStats> = {};
    for (const [key, val] of this.httpLatency.entries()) {
      latencyStats[key] = {
        count: val.count,
        totalMs: val.totalMs,
        minMs: val.minMs === Infinity ? 0 : val.minMs,
        maxMs: val.maxMs,
        avgMs: val.count > 0 ? Math.round((val.totalMs / val.count) * 100) / 100 : 0,
      };
    }

    return {
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        memoryRssBytes: memory.rss,
        memoryHeapUsedBytes: memory.heapUsed,
        memoryHeapTotalBytes: memory.heapTotal,
      },
      requests: Object.fromEntries(this.httpRequests),
      latency: latencyStats,
      errors: Object.fromEntries(this.httpErrors),
      authFailures: Object.fromEntries(this.authFailures),
      authorizationFailures: Object.fromEntries(this.authorizationFailures),
      rateLimitRejections: this.rateLimitRejections,
      backgroundJobs: Object.fromEntries(this.backgroundJobs),
    };
  }

  public getPrometheusText(): string {
    const lines: string[] = [];
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    lines.push('# HELP process_uptime_seconds The uptime of the process in seconds.');
    lines.push('# TYPE process_uptime_seconds gauge');
    lines.push(`process_uptime_seconds ${uptimeSeconds}`);

    lines.push('# HELP http_requests_total Total number of HTTP requests.');
    lines.push('# TYPE http_requests_total counter');
    for (const [key, count] of this.httpRequests.entries()) {
      const [method, route, statusClass] = key.split(' ');
      lines.push(`http_requests_total{method="${method}",route="${route}",status_class="${statusClass}"} ${count}`);
    }

    lines.push('# HELP http_request_duration_ms_avg Average HTTP request duration in ms.');
    lines.push('# TYPE http_request_duration_ms_avg gauge');
    for (const [key, val] of this.httpLatency.entries()) {
      const [method, route] = key.split(' ');
      const avg = val.count > 0 ? (val.totalMs / val.count).toFixed(2) : '0';
      lines.push(`http_request_duration_ms_avg{method="${method}",route="${route}"} ${avg}`);
    }

    lines.push('# HELP rate_limit_rejections_total Total rate limit rejections.');
    lines.push('# TYPE rate_limit_rejections_total counter');
    lines.push(`rate_limit_rejections_total ${this.rateLimitRejections}`);

    return lines.join('\n') + '\n';
  }

  public reset(): void {
    this.httpRequests.clear();
    this.httpLatency.clear();
    this.httpErrors.clear();
    this.authFailures.clear();
    this.authorizationFailures.clear();
    this.rateLimitRejections = 0;
    this.backgroundJobs.clear();
  }
}
