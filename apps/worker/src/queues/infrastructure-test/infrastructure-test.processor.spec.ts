import { Test, TestingModule } from '@nestjs/testing';
import { InfrastructureTestProcessor } from './infrastructure-test.processor';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { Job } from 'bullmq';

describe('InfrastructureTestProcessor (Unit)', () => {
  let processor: InfrastructureTestProcessor;
  let mockRedisService: Partial<RedisService>;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    };

    mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfrastructureTestProcessor,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    processor = module.get<InfrastructureTestProcessor>(InfrastructureTestProcessor);
  });

  afterEach(async () => {
    if (processor) {
      await processor.onModuleDestroy();
    }
  });

  it('should process job successfully and return metadata', async () => {
    const mockJob = {
      id: 'job_unit_1',
      name: 'test-job',
      data: {
        message: 'unit test hello',
        correlationId: 'req_unit_123',
      },
      attemptsMade: 0,
      opts: { attempts: 3 },
    } as unknown as Job;

    const result = await processor.processJob(mockJob);

    expect(result.status).toBe('success');
    expect(result.jobId).toBe('job_unit_1');
    expect(result.correlationId).toBe('req_unit_123');
    expect(result.echoMessage).toBe('unit test hello');
    expect(result.attempt).toBe(1);
    expect(typeof result.durationMs).toBe('number');
  });

  it('should simulate failure and throw error when shouldFail is true on first attempt', async () => {
    const mockJob = {
      id: 'job_unit_retry',
      name: 'test-job',
      data: {
        message: 'retry test',
        correlationId: 'req_unit_retry',
        shouldFail: true,
      },
      attemptsMade: 0,
      opts: { attempts: 3 },
    } as unknown as Job;

    await expect(processor.processJob(mockJob)).rejects.toThrow('Intentional failure on attempt 1');
  });

  it('should succeed on final attempt even when shouldFail was true', async () => {
    const mockJob = {
      id: 'job_unit_retry_success',
      name: 'test-job',
      data: {
        message: 'retry test',
        correlationId: 'req_unit_retry',
        shouldFail: true,
      },
      attemptsMade: 2, // 3rd attempt (attempt = 3)
      opts: { attempts: 3 },
    } as unknown as Job;

    const result = await processor.processJob(mockJob);
    expect(result.status).toBe('success');
    expect(result.attempt).toBe(3);
  });
});
