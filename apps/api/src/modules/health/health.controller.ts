import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { RedisHealthIndicator } from '../../infrastructure/redis/redis.health';
import { BypassTransform } from '../../common/decorators/bypass-transform.decorator';

@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
@BypassTransform()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private prisma: PrismaService,
    private redisIndicator: RedisHealthIndicator
  ) {}

  @Get('liveness')
  checkLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
      () => this.redisIndicator.isHealthy('redis'),
    ]);
  }
}

