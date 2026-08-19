import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { JudgingController } from './judging.controller';
import { JudgingService } from './judging.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [JudgingController],
  providers: [JudgingService],
  exports: [JudgingService],
})
export class JudgingModule {}
