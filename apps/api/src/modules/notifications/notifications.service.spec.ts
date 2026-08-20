import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType, NotificationDeliveryStatus } from '@almosthack/types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;

  const mockPrisma = {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    notificationPreference: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserNotifications', () => {
    it('should return paginated user notifications with meta', async () => {
      const mockNotifications = [
        { id: 'notif-1', userId: 'user-1', title: 'Test 1', readAt: null },
      ];
      prisma.notification.findMany.mockResolvedValue(mockNotifications);
      prisma.notification.count
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // unreadCount

      const res = await service.getUserNotifications('user-1', { page: 1, limit: 20 });

      expect(res.items).toEqual(mockNotifications);
      expect(res.meta.total).toBe(1);
      expect(res.meta.unreadCount).toBe(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: 0,
        take: 20,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count for user', async () => {
      prisma.notification.count.mockResolvedValue(5);

      const res = await service.getUnreadCount('user-1');

      expect(res.unreadCount).toBe(5);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark an unread notification as read', async () => {
      const mockNotif = { id: 'n-1', userId: 'user-1', readAt: null };
      prisma.notification.findUnique.mockResolvedValue(mockNotif);
      prisma.notification.update.mockResolvedValue({
        ...mockNotif,
        readAt: new Date(),
      });

      const res = await service.markAsRead('user-1', 'n-1');

      expect(res.readAt).toBeDefined();
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-1' },
        data: { readAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('user-1', 'n-missing')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException if notification belongs to another user', async () => {
      prisma.notification.findUnique.mockResolvedValue({
        id: 'n-1',
        userId: 'victim-user',
        readAt: null,
      });

      await expect(service.markAsRead('attacker-user', 'n-1')).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read for current user only', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 4 });

      const res = await service.markAllAsRead('user-1');

      expect(res.count).toBe(4);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
        data: { readAt: expect.any(Date) },
      });
    });
  });

  describe('createNotification', () => {
    it('should create notification with idempotency key', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      prisma.notification.findUnique.mockResolvedValue(null);
      prisma.notification.create.mockResolvedValue({
        id: 'n-new',
        userId: 'user-1',
        type: NotificationType.ANNOUNCEMENT,
        title: 'Title',
        body: 'Body',
        idempotencyKey: 'key-123',
      });

      const res = await service.createNotification({
        userId: 'user-1',
        type: NotificationType.ANNOUNCEMENT,
        title: 'Title',
        body: 'Body',
        idempotencyKey: 'key-123',
      });

      expect(res?.id).toBe('n-new');
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should return existing notification if idempotency key already exists', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      const existing = { id: 'n-existing', idempotencyKey: 'key-123' };
      prisma.notification.findUnique.mockResolvedValue(existing);

      const res = await service.createNotification({
        userId: 'user-1',
        type: NotificationType.ANNOUNCEMENT,
        title: 'Title',
        body: 'Body',
        idempotencyKey: 'key-123',
      });

      expect(res).toEqual(existing);
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('should suppress notification if user disabled that category in preferences', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue({
        userId: 'user-1',
        inAppAnnouncements: false,
        inAppReminders: true,
        inAppTeamUpdates: true,
        inAppResults: true,
      });

      const res = await service.createNotification({
        userId: 'user-1',
        type: NotificationType.ANNOUNCEMENT,
        title: 'Title',
        body: 'Body',
      });

      expect(res).toBeNull();
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });
  });
});
