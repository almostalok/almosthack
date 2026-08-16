import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthTestController } from './auth-test.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { AuthorizationService } from './authorization.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { AuthRateLimitGuard } from './guards/rate-limit.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [AuthController, AuthTestController],
  providers: [
    AuthService,
    SessionService,
    AuthorizationService,
    SessionAuthGuard,
    AuthRateLimitGuard,
    PermissionsGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    SessionService,
    AuthorizationService,
    SessionAuthGuard,
    PermissionsGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
