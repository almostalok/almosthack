import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../session.service';
import { SESSION_COOKIE_NAME } from '../auth.constants';
import { RoleName } from '@almosthack/types';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let rawToken: string | undefined = request.cookies?.[SESSION_COOKIE_NAME];

    // Fallback: Check Authorization header if cookie isn't present
    if (!rawToken && request.headers.authorization) {
      const parts = request.headers.authorization.split(' ');
      if (parts.length === 2 && (parts[0] === 'Bearer' || parts[0] === 'Session')) {
        rawToken = parts[1];
      }
    }

    if (!rawToken) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.',
        },
      });
    }

    const session = await this.sessionService.findValidSession(rawToken);

    if (!session) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Session has expired or is invalid. Please log in again.',
        },
      });
    }

    const roles: RoleName[] = session.user.userRoles.map((ur) => ur.role.name as RoleName);

    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
      bio: session.user.bio,
      githubUsername: session.user.githubUsername,
      roles,
    };

    return true;
  }
}
