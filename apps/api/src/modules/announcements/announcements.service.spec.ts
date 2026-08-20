import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AnnouncementStatus, AnnouncementRecipientScope, NotificationType } from '@almosthack/types';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let prisma: any;
  let notificationsService: any;

  const mockPrisma = {
    hackathon: {
      findUnique: jest.fn(),
    },
    hackathonTrack: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    organizationMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    announcement: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    participantRegistration: {
      findMany: jest.fn(),
    },
    teamMember: {
      findMany: jest.fn(),
    },
    judgeAssignment: {
      findMany: jest.fn(),
    },
    submission: {
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrisma)),
  };

  const mockNotificationsService = {
    createBatchNotifications: jest.fn().mockResolvedValue({ count: 2 }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
    prisma = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAnnouncement', () => {
    it('should create draft announcement and write audit log for authorized organizer', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        id: 'h-1',
        organizationId: 'org-1',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'org-user',
        email: 'organizer@test.com',
        userRoles: [],
      });
      prisma.organizationMember.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        role: 'ADMIN',
      });
      prisma.announcement.create.mockResolvedValue({
        id: 'ann-1',
        hackathonId: 'h-1',
        organizationId: 'org-1',
        authorId: 'org-user',
        title: 'Test Announcement',
        body: 'Details here',
        status: AnnouncementStatus.DRAFT,
        recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
      });

      const res = await service.createAnnouncement('h-1', 'org-user', {
        title: 'Test Announcement',
        body: 'Details here',
      });

      expect(res.id).toBe('ann-1');
      expect(prisma.announcement.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'announcement.created',
          targetId: 'ann-1',
        }),
      });
    });

    it('should throw ForbiddenException if user is not organizer of this hackathon', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        id: 'h-1',
        organizationId: 'org-1',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'participant-user',
        userRoles: [],
      });
      prisma.organizationMember.findUnique.mockResolvedValue(null);

      await expect(
        service.createAnnouncement('h-1', 'participant-user', {
          title: 'Test',
          body: 'Details',
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('publishAnnouncement', () => {
    it('should publish announcement, resolve recipients, and create batch notifications', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        id: 'h-1',
        organizationId: 'org-1',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'org-user',
        email: 'organizer@test.com',
        userRoles: [],
      });
      prisma.organizationMember.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        role: 'ADMIN',
      });
      prisma.announcement.findUnique.mockResolvedValue({
        id: 'ann-1',
        hackathonId: 'h-1',
        organizationId: 'org-1',
        authorId: 'org-user',
        title: 'Launch Announcement',
        body: 'Hackathon has started!',
        status: AnnouncementStatus.DRAFT,
        recipientScope: AnnouncementRecipientScope.ALL_PARTICIPANTS,
      });
      prisma.announcement.update.mockResolvedValue({
        id: 'ann-1',
        status: AnnouncementStatus.PUBLISHED,
      });

      // Recipient resolution
      prisma.participantRegistration.findMany.mockResolvedValue([
        { userId: 'part-1' },
        { userId: 'part-2' },
      ]);
      prisma.teamMember.findMany.mockResolvedValue([]);

      const res = await service.publishAnnouncement('h-1', 'ann-1', 'org-user');

      expect(res.status).toBe(AnnouncementStatus.PUBLISHED);
      expect(prisma.announcement.update).toHaveBeenCalledWith({
        where: { id: 'ann-1' },
        data: expect.objectContaining({
          status: AnnouncementStatus.PUBLISHED,
        }),
      });
      expect(notificationsService.createBatchNotifications).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: 'part-1',
            type: NotificationType.ANNOUNCEMENT,
            idempotencyKey: 'announcement_ann-1_part-1',
          }),
          expect.objectContaining({
            userId: 'part-2',
            type: NotificationType.ANNOUNCEMENT,
            idempotencyKey: 'announcement_ann-1_part-2',
          }),
        ])
      );
    });

    it('should be idempotent and not re-notify if already published', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        id: 'h-1',
        organizationId: 'org-1',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'org-user',
        userRoles: [],
      });
      prisma.organizationMember.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        role: 'ADMIN',
      });
      const published = {
        id: 'ann-1',
        hackathonId: 'h-1',
        status: AnnouncementStatus.PUBLISHED,
      };
      prisma.announcement.findUnique.mockResolvedValue(published);

      const res = await service.publishAnnouncement('h-1', 'ann-1', 'org-user');

      expect(res).toEqual(published);
      expect(prisma.announcement.update).not.toHaveBeenCalled();
      expect(notificationsService.createBatchNotifications).not.toHaveBeenCalled();
    });
  });

  describe('scheduleAnnouncement', () => {
    it('should schedule announcement for future timestamp', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        id: 'h-1',
        organizationId: 'org-1',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'org-user',
        email: 'org@test.com',
        userRoles: [],
      });
      prisma.organizationMember.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        role: 'OWNER',
      });
      prisma.announcement.findUnique.mockResolvedValue({
        id: 'ann-1',
        hackathonId: 'h-1',
        status: AnnouncementStatus.DRAFT,
      });
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      prisma.announcement.update.mockResolvedValue({
        id: 'ann-1',
        status: AnnouncementStatus.SCHEDULED,
        scheduledAt: new Date(futureDate),
      });

      const res = await service.scheduleAnnouncement('h-1', 'ann-1', 'org-user', {
        scheduledAt: futureDate,
      });

      expect(res.status).toBe(AnnouncementStatus.SCHEDULED);
      expect(prisma.announcement.update).toHaveBeenCalled();
    });
  });

  describe('cancelAnnouncement', () => {
    it('should cancel a scheduled announcement', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        id: 'h-1',
        organizationId: 'org-1',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'org-user',
        email: 'org@test.com',
        userRoles: [],
      });
      prisma.organizationMember.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        role: 'ADMIN',
      });
      prisma.announcement.findUnique.mockResolvedValue({
        id: 'ann-1',
        hackathonId: 'h-1',
        status: AnnouncementStatus.SCHEDULED,
      });
      prisma.announcement.update.mockResolvedValue({
        id: 'ann-1',
        status: AnnouncementStatus.CANCELLED,
      });

      const res = await service.cancelAnnouncement('h-1', 'ann-1', 'org-user');

      expect(res.status).toBe(AnnouncementStatus.CANCELLED);
    });
  });
});
