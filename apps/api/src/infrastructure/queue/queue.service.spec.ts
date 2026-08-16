import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { RedisService } from '../redis/redis.service';

describe('QueueService (Unit)', () => {
  let queueService: QueueService;
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
        QueueService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    queueService = module.get<QueueService>(QueueService);
  });

  afterEach(async () => {
    if (queueService) {
      await queueService.onModuleDestroy();
    }
  });

  it('should instantiate and cache BullMQ Queue instances', () => {
    const queue1 = queueService.getQueue('test-queue');
    const queue2 = queueService.getQueue('test-queue');

    expect(queue1).toBeDefined();
    expect(queue1).toBe(queue2);
    expect(mockRedisService.getClient).toHaveBeenCalled();
  });

  it('should enqueue job with correlationId and idempotency options', async () => {
    const queue = queueService.getQueue('infrastructure-test');
    const addSpy = jest.spyOn(queue, 'add').mockResolvedValue({ id: 'job_123' } as any);

    const payload = { message: 'hello world' };
    const job = await queueService.addJob('infrastructure-test', 'test-job', payload, {
      jobId: 'custom-job-id-1',
      correlationId: 'req_test_999',
    });

    expect(job.id).toBe('job_123');
    expect(addSpy).toHaveBeenCalledWith(
      'test-job',
      { message: 'hello world', correlationId: 'req_test_999' },
      expect.objectContaining({
        jobId: 'custom-job-id-1',
        correlationId: 'req_test_999',
      })
    );
  });
});
