import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { RedisHealthIndicator } from '../../infrastructure/redis/redis.health';
import { BypassTransform } from '../../common/decorators/bypass-transform.decorator';

@ApiTags('Health & Diagnostics')
@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
@BypassTransform()
export class HealthController {
  private readonly processStartTime = Date.now();

  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private prisma: PrismaService,
    private redisIndicator: RedisHealthIndicator
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health overview' })
  getOverview() {
    return {
      status: 'ok',
      service: 'almosthack-api',
      uptimeSeconds: Math.floor((Date.now() - this.processStartTime) / 1000),
      timestamp: new Date().toISOString(),
      endpoints: {
        liveness: '/health/live',
        readiness: '/health/ready',
      },
    };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Process liveness probe' })
  @ApiResponse({ status: 200, description: 'Process is alive and functioning' })
  checkLiveness() {
    return {
      status: 'ok',
      uptimeSeconds: Math.floor((Date.now() - this.processStartTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Process liveness probe (alias)' })
  @ApiResponse({ status: 200, description: 'Process is alive and functioning' })
  checkLive() {
    return this.checkLiveness();
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Process readiness probe' })
  @ApiResponse({ status: 200, description: 'All runtime dependencies are ready' })
  @ApiResponse({ status: 503, description: 'One or more runtime dependencies are unavailable' })
  checkReadiness() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
      () => this.redisIndicator.isHealthy('redis'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Process readiness probe (alias)' })
  @ApiResponse({ status: 200, description: 'All runtime dependencies are ready' })
  @ApiResponse({ status: 503, description: 'One or more runtime dependencies are unavailable' })
  checkReady() {
    return this.checkReadiness();
  }

  @Get('version')
  @ApiOperation({ summary: 'Build and version metadata' })
  @ApiResponse({ status: 200, description: 'Safe build version and commit metadata' })
  getVersion() {
    return {
      version: process.env.npm_package_version || process.env.APP_VERSION || '1.0.0',
      commitSha: process.env.GIT_COMMIT_SHA || process.env.COMMIT_SHA || process.env.GIT_SHA || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      buildTimestamp: process.env.BUILD_TIMESTAMP || new Date(this.processStartTime).toISOString(),
      service: 'almosthack-api',
    };
  }
}
