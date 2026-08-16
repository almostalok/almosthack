import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { EnqueueTestJobDto } from './dto/enqueue-test-job.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@ApiTags('Infrastructure Test')
@Controller('infrastructure-test')
export class InfrastructureTestController {
  constructor(private readonly queueService: QueueService) {}

  @Post('enqueue')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Enqueue a test job on the infrastructure-test queue (Internal/Dev only)' })
  async enqueue(@Body() dto: EnqueueTestJobDto, @Req() req: Request) {
    const correlationId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
    const payload = {
      message: dto.message || 'hello',
      timestamp: new Date().toISOString(),
      correlationId,
    };

    const job = await this.queueService.addJob(
      'infrastructure-test',
      'test-job',
      payload,
      {
        jobId: dto.jobId,
        correlationId,
      }
    );

    return {
      enqueued: true,
      jobId: job.id,
      queue: 'infrastructure-test',
      jobName: 'test-job',
      correlationId,
      payload,
    };
  }
}
