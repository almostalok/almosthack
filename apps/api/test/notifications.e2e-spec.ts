import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import cookieParser from 'cookie-parser';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';
import { PrismaService } from '../src/database/prisma.service';
import { RedisHealthIndicator } from '../src/infrastructure/redis/redis.health';
import { QueueService } from '../src/infrastructure/queue/queue.service';
import { NotificationType, NotificationDeliveryStatus } from '@prisma/client';

describe('Notifications & Preferences E2E (S6)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();
  let user1Cookie: string;
  let user2Cookie: string;

  let user1Id: string;
  let user2Id: string;

  let notif1User1Id: string;
  let notif2User1Id: string;
  let notifUser2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisHealthIndicator)
      .useValue({ isHealthy: jest.fn().mockResolvedValue(true) })
      .overrideProvider(QueueService)
      .useValue({
        addJob: jest.fn().mockResolvedValue('mock-job-id'),
        isHealthy: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.use(requestIdMiddleware);

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });

    const reflector = app.get(Reflector);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(reflector)
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // 1. Create User 1
    const u1Res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `notif_user1_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Notif User 1',
      })
      .expect(201);
    user1Cookie = u1Res.get('Set-Cookie')?.[0] || '';
    user1Id = u1Res.body.data.id;

    // 2. Create User 2
    const u2Res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `notif_user2_${timestamp}@almosthack.com`,
        password: 'Password123!',
        name: 'Notif User 2',
      })
      .expect(201);
    user2Cookie = u2Res.get('Set-Cookie')?.[0] || '';
    user2Id = u2Res.body.data.id;

    // 3. Seed Notifications for User 1
    const n1 = await prisma.notification.create({
      data: {
        userId: user1Id,
        type: NotificationType.ANNOUNCEMENT,
        title: 'Welcome Announcement',
        body: 'Welcome to AlmostHack!',
        deliveryStatus: NotificationDeliveryStatus.DELIVERED,
      },
    });
    notif1User1Id = n1.id;

    const n2 = await prisma.notification.create({
      data: {
        userId: user1Id,
        type: NotificationType.SUBMISSION_DEADLINE,
        title: 'Submission Reminder',
        body: 'Deadline in 2 hours!',
        deliveryStatus: NotificationDeliveryStatus.DELIVERED,
      },
    });
    notif2User1Id = n2.id;

    // 4. Seed Notification for User 2
    const n3 = await prisma.notification.create({
      data: {
        userId: user2Id,
        type: NotificationType.RESULTS_PUBLISHED,
        title: 'Results Are Out',
        body: 'Check the leaderboard!',
        deliveryStatus: NotificationDeliveryStatus.DELIVERED,
      },
    });
    notifUser2Id = n3.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.notification.deleteMany({
        where: { userId: { in: [user1Id, user2Id] } },
      });
      await prisma.notificationPreference.deleteMany({
        where: { userId: { in: [user1Id, user2Id] } },
      });
      await prisma.session.deleteMany({
        where: { userId: { in: [user1Id, user2Id] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [user1Id, user2Id] } },
      });
    }
    await app.close();
  });

  describe('1. Authentication & Tenant Boundaries', () => {
    it('should reject unauthenticated request to /notifications', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .expect(401);
    });

    it('should retrieve only User 1 notifications for User 1', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.meta.total).toBe(2);
      expect(res.body.data.meta.unreadCount).toBe(2);
      expect(res.body.data.items.every((n: any) => n.userId === user1Id)).toBe(true);
    });

    it('should reject User 1 attempting to mark User 2 notification as read', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/notifications/${notifUser2Id}/read`)
        .set('Cookie', user1Cookie)
        .expect(403);
    });
  });

  describe('2. Read/Unread State Management', () => {
    it('should return server-authoritative unread count of 2 for User 1', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(res.body.data.unreadCount).toBe(2);
    });

    it('should mark a single notification as read', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/notifications/${notif1User1Id}/read`)
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(res.body.data.id).toBe(notif1User1Id);
      expect(res.body.data.readAt).not.toBeNull();

      // Check unread count dropped to 1
      const countRes = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(countRes.body.data.unreadCount).toBe(1);
    });

    it('should filter notifications by unreadOnly=true', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications?unreadOnly=true')
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(notif2User1Id);
    });

    it('should mark all remaining unread notifications as read', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/notifications/read-all')
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(res.body.data.count).toBe(1);

      // Verify unread count is now 0
      const countRes = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(countRes.body.data.unreadCount).toBe(0);
    });
  });

  describe('3. Notification Preferences', () => {
    it('should return default preferences if not yet modified', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/preferences')
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(res.body.data.inAppAnnouncements).toBe(true);
      expect(res.body.data.inAppReminders).toBe(true);
      expect(res.body.data.inAppTeamUpdates).toBe(true);
      expect(res.body.data.inAppResults).toBe(true);
    });

    it('should update user notification preferences', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/notifications/preferences')
        .set('Cookie', user1Cookie)
        .send({
          inAppAnnouncements: false,
          inAppReminders: false,
        })
        .expect(200);

      expect(res.body.data.inAppAnnouncements).toBe(false);
      expect(res.body.data.inAppReminders).toBe(false);
      expect(res.body.data.inAppTeamUpdates).toBe(true);
      expect(res.body.data.inAppResults).toBe(true);

      // Verify persistence via GET
      const getRes = await request(app.getHttpServer())
        .get('/api/v1/notifications/preferences')
        .set('Cookie', user1Cookie)
        .expect(200);

      expect(getRes.body.data.inAppAnnouncements).toBe(false);
      expect(getRes.body.data.inAppReminders).toBe(false);
    });
  });
});
