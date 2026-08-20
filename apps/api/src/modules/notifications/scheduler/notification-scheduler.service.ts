import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AnnouncementsService } from '../../announcements/announcements.service';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '@almosthack/types';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly announcementsService: AnnouncementsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async processDueScheduledAnnouncements(): Promise<{ processedCount: number }> {
    const now = new Date();
    const dueAnnouncements = await this.prisma.announcement.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        },
      },
    });

    let processedCount = 0;

    for (const announcement of dueAnnouncements) {
      try {
        await this.announcementsService.publishAnnouncement(
          announcement.hackathonId,
          announcement.id
        );
        processedCount++;
      } catch (err: any) {
        this.logger.error(
          `Failed to process scheduled announcement ${announcement.id}: ${err.message}`,
          err.stack
        );
      }
    }

    return { processedCount };
  }

  async processMilestoneReminders(): Promise<{ sentCount: number }> {
    const now = new Date();
    const upcomingThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    let sentCount = 0;

    // 1. Hackathons with registration closing in next 24h
    const closingHackathons = await this.prisma.hackathon.findMany({
      where: {
        status: 'PUBLISHED',
        registrationEndsAt: {
          gte: now,
          lte: upcomingThreshold,
        },
      },
      include: {
        registrations: {
          where: { status: 'REGISTERED' },
          select: { userId: true },
        },
      },
    });

    for (const hackathon of closingHackathons) {
      const today = now.toISOString().slice(0, 10);
      const notifications = hackathon.registrations.map((r) => ({
        userId: r.userId,
        hackathonId: hackathon.id,
        organizationId: hackathon.organizationId,
        type: NotificationType.REGISTRATION_CLOSING,
        title: `Registration Closing Soon: ${hackathon.name}`,
        body: `Registration for ${hackathon.name} will close on ${hackathon.registrationEndsAt.toUTCString()}.`,
        metadata: {
          hackathonId: hackathon.id,
          registrationEndsAt: hackathon.registrationEndsAt.toISOString(),
        },
        idempotencyKey: `reminder_reg_closing_${hackathon.id}_${r.userId}_${today}`,
      }));

      const res = await this.notificationsService.createBatchNotifications(notifications);
      sentCount += res.count;
    }

    // 2. Hackathons with submission deadline in next 24h
    const endingHackathons = await this.prisma.hackathon.findMany({
      where: {
        status: { in: ['PUBLISHED', 'LIVE'] },
        endsAt: {
          gte: now,
          lte: upcomingThreshold,
        },
      },
      include: {
        teams: {
          where: { status: 'ACTIVE' },
          include: {
            members: {
              where: { status: 'ACTIVE' },
              select: { userId: true },
            },
          },
        },
      },
    });

    for (const hackathon of endingHackathons) {
      const today = now.toISOString().slice(0, 10);
      const memberUserIds = new Set<string>();
      hackathon.teams.forEach((t) => {
        t.members.forEach((m) => memberUserIds.add(m.userId));
      });

      const notifications = Array.from(memberUserIds).map((userId) => ({
        userId,
        hackathonId: hackathon.id,
        organizationId: hackathon.organizationId,
        type: NotificationType.SUBMISSION_DEADLINE,
        title: `Submission Deadline Approaching: ${hackathon.name}`,
        body: `The project submission deadline for ${hackathon.name} is ${hackathon.endsAt.toUTCString()}. Please finalize and submit your project.`,
        metadata: {
          hackathonId: hackathon.id,
          endsAt: hackathon.endsAt.toISOString(),
        },
        idempotencyKey: `reminder_sub_deadline_${hackathon.id}_${userId}_${today}`,
      }));

      const res = await this.notificationsService.createBatchNotifications(notifications);
      sentCount += res.count;
    }

    return { sentCount };
  }
}
