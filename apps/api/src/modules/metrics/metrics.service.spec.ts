import { MetricsService } from './metrics.service';

describe('MetricsService (S7)', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
    service.reset();
  });

  describe('normalizeRoute', () => {
    it('should normalize UUIDs to :id to avoid high-cardinality label explosion', () => {
      const normalized = service.normalizeRoute('/api/v1/hackathons/550e8400-e29b-41d4-a716-446655440000/announcements');
      expect(normalized).toBe('/api/v1/hackathons/:id/announcements');
    });

    it('should strip query parameters', () => {
      const normalized = service.normalizeRoute('/api/v1/notifications?unreadOnly=true&limit=10');
      expect(normalized).toBe('/api/v1/notifications');
    });
  });

  describe('recordHttpRequest & getMetricsSummary', () => {
    it('should aggregate requests, latency, and status classes', () => {
      service.recordHttpRequest('GET', '/api/v1/hackathons/123/tracks', 200, 45);
      service.recordHttpRequest('GET', '/api/v1/hackathons/456/tracks', 200, 55);
      service.recordHttpRequest('POST', '/api/v1/auth/login', 401, 20);

      const summary = service.getMetricsSummary();

      expect(summary.requests['GET /api/v1/hackathons/:id/tracks 2xx']).toBe(2);
      expect(summary.requests['POST /api/v1/auth/login 4xx']).toBe(1);
      expect(summary.latency['GET /api/v1/hackathons/:id/tracks'].count).toBe(2);
      expect(summary.latency['GET /api/v1/hackathons/:id/tracks'].avgMs).toBe(50);
    });

    it('should track security and rate limit counters', () => {
      service.recordAuthFailure('INVALID_PASSWORD');
      service.recordAuthorizationFailure('/api/v1/results/publish');
      service.recordRateLimitRejection();

      const summary = service.getMetricsSummary();

      expect(summary.authFailures['INVALID_PASSWORD']).toBe(1);
      expect(summary.authorizationFailures['/api/v1/results/publish']).toBe(1);
      expect(summary.rateLimitRejections).toBe(1);
    });
  });

  describe('getPrometheusText', () => {
    it('should generate valid Prometheus formatted lines', () => {
      service.recordHttpRequest('GET', '/api/v1/hackathons', 200, 30);
      service.recordRateLimitRejection();

      const prom = service.getPrometheusText();

      expect(prom).toContain('http_requests_total{method="GET",route="/api/v1/hackathons",status_class="2xx"} 1');
      expect(prom).toContain('rate_limit_rejections_total 1');
      expect(prom).toContain('process_uptime_seconds');
    });
  });
});
