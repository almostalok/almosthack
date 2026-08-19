import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';
import { GitHubCredentialService } from './github-credential.service';
import { GitHubProviderService } from './github-provider.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [RepositoriesController],
  providers: [RepositoriesService, GitHubCredentialService, GitHubProviderService],
  exports: [RepositoriesService, GitHubCredentialService, GitHubProviderService],
})
export class RepositoriesModule {}
