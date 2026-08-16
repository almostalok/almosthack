import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { SessionService } from './session.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { RoleName } from '@almosthack/types';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  githubUsername?: string | null;
  roles: RoleName[];
}

@Injectable()
export class AuthService {
  private readonly bcryptSaltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService
  ) {}

  public async register(
    dto: RegisterDto,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ user: SafeUser; rawToken: string }> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check email uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptSaltRounds);

    // Atomic transaction for user creation, participant role binding, and session generation
      const { user, rawToken } = await this.prisma.$transaction(async (tx) => {
        // Ensure PARTICIPANT role exists in database
        const role = await tx.role.upsert({
          where: { name: RoleName.PARTICIPANT },
          update: {},
          create: {
            name: RoleName.PARTICIPANT,
            description: 'Default participant role',
          },
        });

        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            name: dto.name.trim(),
            passwordHash,
          },
        });

        await tx.userRole.create({
          data: {
            userId: newUser.id,
            roleId: role.id,
          },
        });

        const { rawToken } = await this.sessionService.createSession(
          newUser.id,
          meta?.ipAddress,
          meta?.userAgent,
          tx
        );

        return { user: newUser, rawToken };
      });

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      githubUsername: user.githubUsername,
      roles: [RoleName.PARTICIPANT],
    };

    return { user: safeUser, rawToken };
  }

  public async login(
    dto: LoginDto,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ user: SafeUser; rawToken: string }> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    // Session rotation: Revoke previous active sessions on login
    await this.sessionService.revokeAllUserSessions(user.id);

    // Create new session
    const { rawToken } = await this.sessionService.createSession(
      user.id,
      meta?.ipAddress,
      meta?.userAgent
    );

    const roles: RoleName[] = user.userRoles.map((ur) => ur.role.name as RoleName);

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      githubUsername: user.githubUsername,
      roles,
    };

    return { user: safeUser, rawToken };
  }

  public async logout(rawToken: string): Promise<void> {
    if (rawToken) {
      await this.sessionService.revokeSession(rawToken);
    }
  }

  public async getSafeUser(userId: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      githubUsername: user.githubUsername,
      roles: user.userRoles.map((ur) => ur.role.name as RoleName),
    };
  }
}
