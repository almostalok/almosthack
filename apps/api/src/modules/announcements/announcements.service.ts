import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  AnnouncementStatus,
  AnnouncementRecipientScope,
  NotificationType,
  AnnouncementEntity,
} from '@almosthack/types';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  ScheduleAnnouncementDto,
  AnnouncementQueryDto,
} from './dto/announcements.dto';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  private async verifyOrganizerAccess(hackathonId: string, userId: string): Promise<{ organizationId: string }> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: { organization: true },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${hackathonId} not found`);
    }

    const [user, orgMember] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { userRoles: { include: { role: true } } },
      }),
      this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: hackathon.organizationId,
            userId,
          },
        },
      }),
    ]);

    const isGlobalAdmin = user?.userRoles.some((ur) => ur.role.name === 'ADMIN') ?? false;
    const isOrgAdmin =
      orgMember &&
      orgMember.status === 'ACTIVE' &&
      (orgMember.role === 'OWNER' || orgMember.role === 'ADMIN');

    if (!isGlobalAdmin && !isOrgAdmin) {
      throw new ForbiddenException('You must be an organizer of this hackathon to perform this action');
    }

    return { organizationId: hackathon.organizationId };
  }

  private async isOrganizer(hackathonId: string, userId: string): Promise<boolean> {
    try {
      await this.verifyOrganizerAccess(hackathonId, userId);
      return true;
    } catch {
      return false;
    }
  }

  async createAnnouncement(
    hackathonId: string,
    authorId: string,
    dto: CreateAnnouncementDto
  ): Promise<AnnouncementEntity> {
    const { organizationId } = await this.verifyOrganizerAccess(hackathonId, authorId);

    if (dto.targetTrackId) {
      const track = await this.prisma.hackathonTrack.findUnique({
        where: { id: dto.targetTrackId },
      });
      if (!track || track.hackathonId !== hackathonId) {
        throw new BadRequestException('Target track does not belong to this hackathon');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, email: true },
    });

    const announcement = await this.prisma.$transaction(async (tx) => {
      const created = await tx.announcement.create({
        data: {
          hackathonId,
          organizationId,
          authorId,
          title: dto.title.trim(),
          body: dto.body.trim(),
          status: AnnouncementStatus.DRAFT,
          recipientScope: dto.recipientScope ?? AnnouncementRecipientScope.ALL_PARTICIPANTS,
          targetTrackId: dto.targetTrackId ?? null,
          metadata: (dto.metadata as any) ?? undefined,
          version: 1,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: authorId,
          actorEmail: user?.email || 'system@almosthack.com',
          action: 'announcement.created',
          targetEntity: 'Announcement',
          targetId: created.id,
          metadata: {
            hackathonId,
            organizationId,
            recipientScope: created.recipientScope,
            title: created.title,
          },
        },
      });

      return created;
    });

    return announcement as unknown as AnnouncementEntity;
  }

  async getAnnouncements(
    hackathonId: string,
    userId: string,
    query: AnnouncementQueryDto
  ): Promise<AnnouncementEntity[]> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${hackathonId} not found`);
    }

    const isOrg = await this.isOrganizer(hackathonId, userId);

    const where: any = {
      hackathonId,
    };

    if (!isOrg) {
      // Non-organizers ONLY see published announcements
      where.status = AnnouncementStatus.PUBLISHED;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.targetTrackId) {
      where.targetTrackId = query.targetTrackId;
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return announcements as unknown as AnnouncementEntity[];
  }

  async getAnnouncement(
    hackathonId: string,
    announcementId: string,
    userId: string
  ): Promise<AnnouncementEntity> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!announcement || announcement.hackathonId !== hackathonId) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found in this hackathon`);
    }

    if (announcement.status !== AnnouncementStatus.PUBLISHED) {
      await this.verifyOrganizerAccess(hackathonId, userId);
    }

    return announcement as unknown as AnnouncementEntity;
  }

  async updateAnnouncement(
    hackathonId: string,
    announcementId: string,
    authorId: string,
    dto: UpdateAnnouncementDto
  ): Promise<AnnouncementEntity> {
    const { organizationId } = await this.verifyOrganizerAccess(hackathonId, authorId);

    const existing = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existing || existing.hackathonId !== hackathonId) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found`);
    }

    if (existing.status === AnnouncementStatus.PUBLISHED || existing.status === AnnouncementStatus.CANCELLED) {
      throw new ConflictException(`Cannot edit an announcement with status ${existing.status}`);
    }

    if (dto.targetTrackId) {
      const track = await this.prisma.hackathonTrack.findUnique({
        where: { id: dto.targetTrackId },
      });
      if (!track || track.hackathonId !== hackathonId) {
        throw new BadRequestException('Target track does not belong to this hackathon');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, email: true },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.announcement.update({
        where: { id: announcementId },
        data: {
          ...(dto.title && { title: dto.title.trim() }),
          ...(dto.body && { body: dto.body.trim() }),
          ...(dto.recipientScope && { recipientScope: dto.recipientScope }),
          ...(dto.targetTrackId !== undefined && { targetTrackId: dto.targetTrackId }),
          ...(dto.metadata && { metadata: dto.metadata as any }),
          version: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: authorId,
          actorEmail: user?.email || 'system@almosthack.com',
          action: 'announcement.updated',
          targetEntity: 'Announcement',
          targetId: result.id,
          metadata: {
            hackathonId,
            organizationId,
            version: result.version,
          },
        },
      });

      return result;
    });

    return updated as unknown as AnnouncementEntity;
  }

  async scheduleAnnouncement(
    hackathonId: string,
    announcementId: string,
    authorId: string,
    dto: ScheduleAnnouncementDto
  ): Promise<AnnouncementEntity> {
    const { organizationId } = await this.verifyOrganizerAccess(hackathonId, authorId);

    const existing = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existing || existing.hackathonId !== hackathonId) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found`);
    }

    if (existing.status !== AnnouncementStatus.DRAFT && existing.status !== AnnouncementStatus.SCHEDULED) {
      throw new ConflictException(`Only draft or scheduled announcements can be scheduled`);
    }

    const scheduledDate = new Date(dto.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid scheduledAt timestamp');
    }

    if (scheduledDate.getTime() <= Date.now()) {
      throw new BadRequestException('scheduledAt must be a timestamp in the future');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, email: true },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.announcement.update({
        where: { id: announcementId },
        data: {
          status: AnnouncementStatus.SCHEDULED,
          scheduledAt: scheduledDate,
          version: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: authorId,
          actorEmail: user?.email || 'system@almosthack.com',
          action: 'announcement.scheduled',
          targetEntity: 'Announcement',
          targetId: result.id,
          metadata: {
            hackathonId,
            organizationId,
            scheduledAt: scheduledDate.toISOString(),
          },
        },
      });

      return result;
    });

    return updated as unknown as AnnouncementEntity;
  }

  async cancelAnnouncement(
    hackathonId: string,
    announcementId: string,
    authorId: string
  ): Promise<AnnouncementEntity> {
    const { organizationId } = await this.verifyOrganizerAccess(hackathonId, authorId);

    const existing = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existing || existing.hackathonId !== hackathonId) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found`);
    }

    if (existing.status !== AnnouncementStatus.SCHEDULED && existing.status !== AnnouncementStatus.DRAFT) {
      throw new ConflictException(`Only draft or scheduled announcements can be cancelled`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, email: true },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.announcement.update({
        where: { id: announcementId },
        data: {
          status: AnnouncementStatus.CANCELLED,
          cancelledAt: new Date(),
          version: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: authorId,
          actorEmail: user?.email || 'system@almosthack.com',
          action: 'announcement.cancelled',
          targetEntity: 'Announcement',
          targetId: result.id,
          metadata: {
            hackathonId,
            organizationId,
          },
        },
      });

      return result;
    });

    return updated as unknown as AnnouncementEntity;
  }

  async resolveRecipients(
    hackathonId: string,
    recipientScope: AnnouncementRecipientScope,
    targetTrackId?: string | null
  ): Promise<string[]> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      return [];
    }

    const recipientSet = new Set<string>();

    switch (recipientScope) {
      case AnnouncementRecipientScope.ALL_PARTICIPANTS: {
        const registrations = await this.prisma.participantRegistration.findMany({
          where: {
            hackathonId,
            status: 'REGISTERED',
          },
          select: { userId: true },
        });
        registrations.forEach((r) => recipientSet.add(r.userId));

        const teamMembers = await this.prisma.teamMember.findMany({
          where: {
            status: 'ACTIVE',
            team: {
              hackathonId,
              status: 'ACTIVE',
            },
          },
          select: { userId: true },
        });
        teamMembers.forEach((tm) => recipientSet.add(tm.userId));
        break;
      }

      case AnnouncementRecipientScope.ALL_TEAMS: {
        const teamMembers = await this.prisma.teamMember.findMany({
          where: {
            status: 'ACTIVE',
            team: {
              hackathonId,
              status: 'ACTIVE',
            },
          },
          select: { userId: true },
        });
        teamMembers.forEach((tm) => recipientSet.add(tm.userId));
        break;
      }

      case AnnouncementRecipientScope.ALL_ORGANIZERS: {
        const orgMembers = await this.prisma.organizationMember.findMany({
          where: {
            organizationId: hackathon.organizationId,
            status: 'ACTIVE',
            role: { in: ['OWNER', 'ADMIN'] },
          },
          select: { userId: true },
        });
        orgMembers.forEach((om) => recipientSet.add(om.userId));
        break;
      }

      case AnnouncementRecipientScope.ALL_JUDGES: {
        const judgeAssignments = await this.prisma.judgeAssignment.findMany({
          where: {
            hackathonId,
            status: { not: 'REVOKED' },
          },
          select: { judgeUserId: true },
        });
        judgeAssignments.forEach((ja) => recipientSet.add(ja.judgeUserId));
        break;
      }

      case AnnouncementRecipientScope.TRACK: {
        if (targetTrackId) {
          const trackRegistrations = await this.prisma.participantRegistration.findMany({
            where: {
              hackathonId,
              trackId: targetTrackId,
              status: 'REGISTERED',
            },
            select: { userId: true },
          });
          trackRegistrations.forEach((r) => recipientSet.add(r.userId));

          const trackSubmissions = await this.prisma.submission.findMany({
            where: {
              hackathonId,
              trackId: targetTrackId,
            },
            select: {
              team: {
                select: {
                  members: {
                    where: { status: 'ACTIVE' },
                    select: { userId: true },
                  },
                },
              },
            },
          });
          trackSubmissions.forEach((sub) => {
            sub.team?.members.forEach((m) => recipientSet.add(m.userId));
          });
        }
        break;
      }
    }

    return Array.from(recipientSet);
  }

  async publishAnnouncement(
    hackathonId: string,
    announcementId: string,
    authorId?: string
  ): Promise<AnnouncementEntity> {
    if (authorId) {
      await this.verifyOrganizerAccess(hackathonId, authorId);
    }

    const existing = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existing || existing.hackathonId !== hackathonId) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found`);
    }

    // Idempotent return if already published
    if (existing.status === AnnouncementStatus.PUBLISHED) {
      return existing as unknown as AnnouncementEntity;
    }

    if (existing.status === AnnouncementStatus.CANCELLED) {
      throw new ConflictException('Cannot publish a cancelled announcement');
    }

    const user = authorId
      ? await this.prisma.user.findUnique({
          where: { id: authorId },
          select: { id: true, email: true },
        })
      : null;

    const publishedAt = new Date();

    const published = await this.prisma.$transaction(async (tx) => {
      const result = await tx.announcement.update({
        where: { id: announcementId },
        data: {
          status: AnnouncementStatus.PUBLISHED,
          publishedAt,
          version: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: authorId || existing.authorId,
          actorEmail: user?.email || 'system@almosthack.com',
          action: 'announcement.published',
          targetEntity: 'Announcement',
          targetId: result.id,
          metadata: {
            hackathonId,
            organizationId: existing.organizationId,
            recipientScope: existing.recipientScope,
            publishedAt: publishedAt.toISOString(),
          },
        },
      });

      return result;
    });

    // Resolve recipients and generate in-app notifications
    const recipientUserIds = await this.resolveRecipients(
      hackathonId,
      existing.recipientScope as AnnouncementRecipientScope,
      existing.targetTrackId
    );

    if (recipientUserIds.length > 0) {
      const notifications = recipientUserIds.map((recipientId) => ({
        userId: recipientId,
        organizationId: existing.organizationId,
        hackathonId,
        type: NotificationType.ANNOUNCEMENT,
        title: existing.title,
        body: existing.body,
        metadata: {
          announcementId: existing.id,
          recipientScope: existing.recipientScope,
          targetTrackId: existing.targetTrackId,
        },
        idempotencyKey: `announcement_${existing.id}_${recipientId}`,
      }));

      await this.notificationsService.createBatchNotifications(notifications);
    }

    return published as unknown as AnnouncementEntity;
  }
}
