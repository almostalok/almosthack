import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HackathonsController } from './hackathons.controller';
import { HackathonsService } from './hackathons.service';

@Module({
  imports: [AuthModule],
  controllers: [HackathonsController],
  providers: [HackathonsService],
  exports: [HackathonsService],
})
export class HackathonsModule {}
