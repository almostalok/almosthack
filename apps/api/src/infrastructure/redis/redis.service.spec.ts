import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

describe('RedisService (Unit)', () => {
  let service: RedisService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'redisUrl') return 'redis://localhost:6379';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    if (service) {
      await service.onModuleDestroy();
    }
  });

  it('should initialize Redis client on module init', () => {
    service.onModuleInit();
    const client = service.getClient();
    expect(client).toBeDefined();
    expect(mockConfigService.get).toHaveBeenCalledWith('redisUrl', 'redis://localhost:6379');
  });

  it('should expose ping method', async () => {
    service.onModuleInit();
    const client = service.getClient();
    jest.spyOn(client, 'ping').mockResolvedValue('PONG');

    const result = await service.ping();
    expect(result).toBe('PONG');
  });

  it('should handle graceful module destruction', async () => {
    service.onModuleInit();
    const client = service.getClient();
    const quitSpy = jest.spyOn(client, 'quit').mockResolvedValue('OK');

    await service.onModuleDestroy();
    expect(quitSpy).toHaveBeenCalled();
  });
});
