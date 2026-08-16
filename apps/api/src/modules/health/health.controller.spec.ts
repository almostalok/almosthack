import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '../../database/prisma.service';
import { RedisHealthIndicator } from '../../infrastructure/redis/redis.health';

describe('HealthController (Unit)', () => {
  let controller: HealthController;
  let prismaIndicator: PrismaHealthIndicator;
  let redisIndicator: RedisHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockImplementation((checks) => {
              return Promise.all(checks.map((fn: () => any) => fn())).then((results) => ({
                status: 'ok',
                info: Object.assign({}, ...results),
                error: {},
                details: Object.assign({}, ...results),
              }));
            }),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
          },
        },
        {
          provide: RedisHealthIndicator,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue({ redis: { status: 'up' } }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaIndicator = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
    redisIndicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  it('should return liveness ok payload', () => {
    const liveness = controller.checkLiveness();
    expect(liveness).toBeDefined();
    expect(liveness.status).toBe('ok');
    expect(liveness.timestamp).toBeDefined();
  });

  it('should return readiness check passing PostgreSQL and Redis', async () => {
    const readiness = await controller.checkReadiness();
    expect(readiness).toBeDefined();
    expect(readiness.status).toBe('ok');
    expect(prismaIndicator.pingCheck).toHaveBeenCalledWith('database', expect.anything());
    expect(redisIndicator.isHealthy).toHaveBeenCalledWith('redis');
  });
});

