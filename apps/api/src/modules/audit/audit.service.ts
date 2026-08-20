import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async queryAuditLogs(query: QueryAuditLogsDto, organizationId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.action) {
      where.action = query.action;
    }

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.targetEntity) {
      where.targetEntity = query.targetEntity;
    }

    if (query.targetId) {
      where.targetId = query.targetId;
    }

    if (organizationId) {
      where.metadata = {
        path: ['organizationId'],
        equals: organizationId,
      };
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async recordLog(data: {
    actorId: string;
    actorEmail: string;
    action: string;
    targetEntity: string;
    targetId: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        actorEmail: data.actorEmail,
        action: data.action,
        targetEntity: data.targetEntity,
        targetId: data.targetId,
        metadata: (data.metadata || {}) as any,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}
