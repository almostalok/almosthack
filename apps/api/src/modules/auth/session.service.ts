import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { SESSION_LIFETIME_MS } from './auth.constants';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  public generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  public async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    dbClient?: any
  ): Promise<{ rawToken: string; expiresAt: Date }> {
    const db = dbClient || this.prisma;
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

    await db.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    return { rawToken, expiresAt };
  }

  public async findValidSession(rawToken: string) {
    if (!rawToken) return null;
    const tokenHash = this.hashToken(rawToken);

    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session) return null;
    if (session.revokedAt !== null) return null;
    if (session.expiresAt <= new Date()) return null;

    // Asynchronously update lastUsedAt
    this.prisma.session
      .update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {
        // Non-blocking log/ignore
      });

    return session;
  }

  public async revokeSession(rawToken: string): Promise<boolean> {
    if (!rawToken) return false;
    const tokenHash = this.hashToken(rawToken);

    try {
      const session = await this.prisma.session.findUnique({ where: { tokenHash } });
      if (!session || session.revokedAt !== null) {
        return false;
      }

      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
