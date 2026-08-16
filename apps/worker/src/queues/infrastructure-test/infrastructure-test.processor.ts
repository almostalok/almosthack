import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface TestJobPayload {
  message?: string;
  correlationId?: string;
  shouldFail?: boolean;
  timestamp?: string;
}

@Injectable()
export class InfrastructureTestProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InfrastructureTestProcessor.name);
  private worker!: Worker<TestJobPayload>;

  constructor(private readonly redisService: RedisService) {}

  onModuleInit(): void {
    this.logger.log("Registering BullMQ Worker for queue 'infrastructure-test'");

    this.worker = new Worker<TestJobPayload>(
      'infrastructure-test',
      async (job: Job<TestJobPayload>) => {
        return this.processJob(job);
      },
      {
        connection: this.redisService.getClient(),
        concurrency: 5,
      }
    );

    this.worker.on('completed', (job: Job<TestJobPayload>, returnvalue: any) => {
      this.logger.log(
        `Job completed [queue=infrastructure-test, name=${job.name}, id=${job.id}, correlationId=${job.data?.correlationId || 'none'}, result=${JSON.stringify(returnvalue)}]`
      );
    });

    this.worker.on('failed', (job: Job<TestJobPayload> | undefined, err: Error) => {
      const id = job?.id || 'unknown';
      const name = job?.name || 'unknown';
      const correlationId = job?.data?.correlationId || 'none';
      const attempts = job?.attemptsMade || 0;
      this.logger.error(
        `Job failed [queue=infrastructure-test, name=${name}, id=${id}, attempt=${attempts}, correlationId=${correlationId}, error=${err.message}]`
      );
    });

    this.worker.on('error', (err: Error) => {
      this.logger.error(`BullMQ Worker system error: ${err.message}`, err.stack);
    });
  }

  async processJob(job: Job<TestJobPayload>): Promise<any> {
    const startTime = Date.now();
    const correlationId = job.data?.correlationId || 'none';
    const attempt = job.attemptsMade + 1;

    this.logger.log(
      `Processing job [queue=infrastructure-test, name=${job.name}, id=${job.id}, attempt=${attempt}, correlationId=${correlationId}, payload=${JSON.stringify(job.data)}]`
    );

    if (job.data?.shouldFail && attempt < (job.opts?.attempts || 3)) {
      const duration = Date.now() - startTime;
      this.logger.warn(
        `Simulating intentional job failure for retry test [jobId=${job.id}, attempt=${attempt}, duration=${duration}ms]`
      );
      throw new Error(`Intentional failure on attempt ${attempt}`);
    }

    const duration = Date.now() - startTime;
    this.logger.log(
      `Job execution successful [queue=infrastructure-test, name=${job.name}, id=${job.id}, attempt=${attempt}, correlationId=${correlationId}, duration=${duration}ms]`
    );

    return {
      status: 'success',
      processedAt: new Date().toISOString(),
      jobId: job.id,
      correlationId,
      attempt,
      durationMs: duration,
      echoMessage: job.data?.message || 'hello',
    };
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      this.logger.log("Closing Worker for queue 'infrastructure-test'...");
      try {
        await this.worker.close();
        this.logger.log("Worker for queue 'infrastructure-test' closed cleanly");
      } catch (err: any) {
        this.logger.warn(`Error closing worker: ${err.message}`);
      }
    }
  }
}
