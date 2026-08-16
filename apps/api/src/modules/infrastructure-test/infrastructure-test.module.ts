import { Module } from '@nestjs/common';
import { InfrastructureTestController } from './infrastructure-test.controller';

@Module({
  controllers: [InfrastructureTestController],
})
export class InfrastructureTestModule {}
