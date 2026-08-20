import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../database/prisma.service';

describe('AuditService (Unit)', () => {
  let service: AuditService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      auditLog: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'log_123',
            actorId: 'usr_1',
            actorEmail: 'admin@almosthack.com',
            action: 'hackathon.created',
            targetEntity: 'Hackathon',
            targetId: 'hack_1',
            metadata: { title: 'AI Hack' },
            createdAt: new Date(),
            actor: {
              id: 'usr_1',
              email: 'admin@almosthack.com',
              name: 'Admin',
            },
          },
        ]),
        create: jest.fn().mockResolvedValue({ id: 'log_new' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should query audit logs with pagination and filters', async () => {
    const res = await service.queryAuditLogs({
      page: 1,
      limit: 10,
      action: 'hackathon.created',
    });

    expect(res.pagination.total).toBe(1);
    expect(res.pagination.page).toBe(1);
    expect(res.items.length).toBe(1);
    expect(prisma.auditLog.findMany).toHaveBeenCalled();
  });

  it('should record an audit log entry', async () => {
    const res = await service.recordLog({
      actorId: 'usr_1',
      actorEmail: 'admin@almosthack.com',
      action: 'team.created',
      targetEntity: 'Team',
      targetId: 'team_1',
      metadata: { name: 'Team Alpha' },
    });

    expect(res).toHaveProperty('id', 'log_new');
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
