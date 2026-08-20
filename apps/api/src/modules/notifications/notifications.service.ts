import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType, NotificationDeliveryStatus, PaginatedNotificationsResponseDto, NotificationEntity, NotificationPreferenceEntity } from '@almosthack/types';
import { NotificationQueryDto, UpdateNotificationPreferenceDto } from './dto/notifications.dto';

export interface CreateNotificationParams {
  userId: string;
  organizationId?: string | null;
  hackathonId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown> | null;
  idempotencyKey?: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(
    userId: string,
    query: NotificationQueryDto
  ): Promise<PaginatedNotificationsResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (query.unreadOnly) {
      where.readAt = null;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.hackathonId) {
      where.hackathonId = query.hackathonId;
    }

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items as unknown as NotificationEntity[],
      meta: {
        page,
        limit,
        total,
        totalPages,
        unreadCount,
      },
    };
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return { unreadCount };
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You are not authorized to access this notification');
    }

    if (notification.readAt) {
      return notification as unknown as NotificationEntity;
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    return updated as unknown as NotificationEntity;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferenceEntity> {
    let pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await this.prisma.notificationPreference.create({
        data: {
          userId,
          inAppAnnouncements: true,
          inAppReminders: true,
          inAppTeamUpdates: true,
          inAppResults: true,
        },
      });
    }

    return pref as unknown as NotificationPreferenceEntity;
  }

  async updateUserPreferences(
    userId: string,
    dto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreferenceEntity> {
    const pref = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        inAppAnnouncements: dto.inAppAnnouncements ?? true,
        inAppReminders: dto.inAppReminders ?? true,
        inAppTeamUpdates: dto.inAppTeamUpdates ?? true,
        inAppResults: dto.inAppResults ?? true,
      },
      update: {
        ...(dto.inAppAnnouncements !== undefined && { inAppAnnouncements: dto.inAppAnnouncements }),
        ...(dto.inAppReminders !== undefined && { inAppReminders: dto.inAppReminders }),
        ...(dto.inAppTeamUpdates !== undefined && { inAppTeamUpdates: dto.inAppTeamUpdates }),
        ...(dto.inAppResults !== undefined && { inAppResults: dto.inAppResults }),
      },
    });

    return pref as unknown as NotificationPreferenceEntity;
  }

  async isNotificationAllowedByUser(userId: string, type: NotificationType): Promise<boolean> {
    const pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      return true;
    }

    switch (type) {
      case NotificationType.ANNOUNCEMENT:
        return pref.inAppAnnouncements;
      case NotificationType.REGISTRATION_CLOSING:
      case NotificationType.SUBMISSION_DEADLINE:
      case NotificationType.JUDGING_STARTED:
      case NotificationType.JUDGING_COMPLETED:
        return pref.inAppReminders;
      case NotificationType.TEAM_UPDATE:
        return pref.inAppTeamUpdates;
      case NotificationType.RESULTS_PUBLISHED:
        return pref.inAppResults;
      default:
        return true;
    }
  }

  async createNotification(params: CreateNotificationParams): Promise<NotificationEntity | null> {
    const allowed = await this.isNotificationAllowedByUser(params.userId, params.type);
    if (!allowed) {
      this.logger.debug(`Notification type ${params.type} suppressed for user ${params.userId} by preferences`);
      return null;
    }

    if (params.idempotencyKey) {
      const existing = await this.prisma.notification.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existing) {
        this.logger.debug(`Notification with idempotency key ${params.idempotencyKey} already exists`);
        return existing as unknown as NotificationEntity;
      }
    }

    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: params.userId,
          organizationId: params.organizationId,
          hackathonId: params.hackathonId,
          type: params.type,
          title: params.title,
          body: params.body,
          metadata: (params.metadata as any) ?? undefined,
          deliveryStatus: NotificationDeliveryStatus.DELIVERED,
          idempotencyKey: params.idempotencyKey,
        },
      });

      return notification as unknown as NotificationEntity;
    } catch (err: any) {
      if (err.code === 'P2002' && params.idempotencyKey) {
        const existing = await this.prisma.notification.findUnique({
          where: { idempotencyKey: params.idempotencyKey },
        });
        return existing as unknown as NotificationEntity;
      }
      this.logger.error(`Failed to create notification: ${err.message}`, err.stack);
      throw err;
    }
  }

  async createBatchNotifications(
    notifications: CreateNotificationParams[]
  ): Promise<{ count: number }> {
    if (!notifications.length) {
      return { count: 0 };
    }

    // Filter recipients against preferences
    const userIds = Array.from(new Set(notifications.map((n) => n.userId)));
    const preferences = await this.prisma.notificationPreference.findMany({
      where: { userId: { in: userIds } },
    });
    const prefMap = new Map(preferences.map((p) => [p.userId, p]));

    const eligibleNotifications = notifications.filter((n) => {
      const pref = prefMap.get(n.userId);
      if (!pref) return true;
      switch (n.type) {
        case NotificationType.ANNOUNCEMENT:
          return pref.inAppAnnouncements;
        case NotificationType.REGISTRATION_CLOSING:
        case NotificationType.SUBMISSION_DEADLINE:
        case NotificationType.JUDGING_STARTED:
        case NotificationType.JUDGING_COMPLETED:
          return pref.inAppReminders;
        case NotificationType.TEAM_UPDATE:
          return pref.inAppTeamUpdates;
        case NotificationType.RESULTS_PUBLISHED:
          return pref.inAppResults;
        default:
          return true;
      }
    });

    if (!eligibleNotifications.length) {
      return { count: 0 };
    }

    const data = eligibleNotifications.map((n) => ({
      userId: n.userId,
      organizationId: n.organizationId ?? null,
      hackathonId: n.hackathonId ?? null,
      type: n.type,
      title: n.title,
      body: n.body,
      metadata: (n.metadata as any) ?? undefined,
      deliveryStatus: NotificationDeliveryStatus.DELIVERED,
      idempotencyKey: n.idempotencyKey ?? null,
    }));

    const result = await this.prisma.notification.createMany({
      data,
      skipDuplicates: true,
    });

    return { count: result.count };
  }
}
