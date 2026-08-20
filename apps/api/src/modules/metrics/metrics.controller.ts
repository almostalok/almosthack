import { Controller, Get, Header, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { BypassTransform } from '../../common/decorators/bypass-transform.decorator';

@ApiTags('Metrics & Observability')
@Controller({
  path: 'metrics',
  version: VERSION_NEUTRAL,
})
@BypassTransform()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Get application operational metrics summary (JSON)' })
  @ApiResponse({ status: 200, description: 'Structured JSON metrics summary' })
  getMetricsSummary() {
    return this.metricsService.getMetricsSummary();
  }

  @Get('prometheus')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  @ApiOperation({ summary: 'Get Prometheus formatted metrics' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics text' })
  getPrometheusMetrics(): string {
    return this.metricsService.getPrometheusText();
  }
}
