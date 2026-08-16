import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, JobsOptions, Job } from 'bullmq';
import { RedisService } from '../redis/redis.service';

export interface EnqueueJobOptions extends JobsOptions {
  correlationId?: string;
  jobId?: string;
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly redisService: RedisService) {}

  getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      this.logger.log(`Initializing BullMQ Queue for '${queueName}'`);
      const queue = new Queue(queueName, {
        connection: this.redisService.getClient(),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: {
            age: 3600, // keep completed jobs for 1 hour
            count: 1000,
          },
          removeOnFail: {
            age: 86400, // keep failed jobs for 24 hours
            count: 5000,
          },
        },
      });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  async addJob<T extends object>(
    queueName: string,
    jobName: string,
    payload: T,
    options: EnqueueJobOptions = {}
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);

    const correlationId = options.correlationId || (payload as any).correlationId;
    const finalPayload = correlationId ? { ...payload, correlationId } : payload;

    const jobOpts: JobsOptions = { ...options };
    if (options.jobId) {
      jobOpts.jobId = options.jobId;
    }

    this.logger.log(
      `Enqueueing job '${jobName}' on queue '${queueName}' (jobId: ${jobOpts.jobId || 'auto'}, correlationId: ${correlationId || 'none'})`
    );

    const job = await queue.add(jobName, finalPayload, jobOpts);
    return job;
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing all BullMQ queues...');
    for (const [queueName, queue] of this.queues.entries()) {
      try {
        await queue.close();
        this.logger.log(`Closed queue '${queueName}' cleanly`);
      } catch (err: any) {
        this.logger.warn(`Error closing queue '${queueName}': ${err.message}`);
      }
    }
    this.queues.clear();
  }
}
