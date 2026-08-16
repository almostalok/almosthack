import { Module } from '@nestjs/common';
import { InfrastructureTestController } from './infrastructure-test.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InfrastructureTestController],
})
export class InfrastructureTestModule {}
