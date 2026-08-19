import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { IntegrityEngineService } from './integrity-engine.service';
import { IntegrityService } from './integrity.service';
import { IntegrityController } from './integrity.controller';

@Module({
  imports: [DatabaseModule, AuthModule, RepositoriesModule],
  controllers: [IntegrityController],
  providers: [IntegrityEngineService, IntegrityService],
  exports: [IntegrityEngineService, IntegrityService],
})
export class IntegrityModule {}
