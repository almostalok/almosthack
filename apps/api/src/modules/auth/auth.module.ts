import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { AuthRateLimitGuard } from './guards/rate-limit.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    SessionAuthGuard,
    AuthRateLimitGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    SessionService,
    SessionAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
