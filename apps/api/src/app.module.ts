import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { InfrastructureTestModule } from './modules/infrastructure-test/infrastructure-test.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { HackathonsModule } from './modules/hackathons/hackathons.module';
import { RoundsModule } from './modules/rounds/rounds.module';
import { TeamsModule } from './modules/teams/teams.module';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { JudgingModule } from './modules/judging/judging.module';
import { IntegrityModule } from './modules/integrity/integrity.module';
import { AppealsModule } from './modules/appeals/appeals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AuditModule } from './modules/audit/audit.module';
import { ResultsModule } from './modules/results/results.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    DatabaseModule,
    RedisModule,
    QueueModule,
    InfrastructureTestModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    HackathonsModule,
    RoundsModule,
    TeamsModule,
    RepositoriesModule,
    SubmissionsModule,
    JudgingModule,
    IntegrityModule,
    ResultsModule,
    AppealsModule,
    NotificationsModule,
    AnnouncementsModule,
    AuditModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
