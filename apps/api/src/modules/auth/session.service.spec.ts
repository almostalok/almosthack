import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { PrismaService } from '../../database/prisma.service';

describe('SessionService', () => {
  let service: SessionService;
  let prismaMock: {
    session: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should generate a cryptographically secure 64-char hex raw token', () => {
    const rawToken = service.generateRawToken();
    expect(rawToken).toBeDefined();
    expect(typeof rawToken).toBe('string');
    expect(rawToken.length).toBe(64);
  });

  it('should compute consistent SHA-256 token hash', () => {
    const rawToken = 'test_raw_token_12345';
    const hash1 = service.hashToken(rawToken);
    const hash2 = service.hashToken(rawToken);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(rawToken);
  });

  it('should create session and store token hash in database', async () => {
    prismaMock.session.create.mockResolvedValue({ id: 'sess_123' });

    const result = await service.createSession('user_1', '127.0.0.1', 'jest-agent');

    expect(result.rawToken).toBeDefined();
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(prismaMock.session.create).toHaveBeenCalledTimes(1);
    const createArg = prismaMock.session.create.mock.calls[0][0].data;
    expect(createArg.userId).toBe('user_1');
    expect(createArg.tokenHash).toBe(service.hashToken(result.rawToken));
  });

  it('should return null for expired or revoked session lookup', async () => {
    const rawToken = 'valid_raw_token';
    const expiredSession = {
      id: 'sess_999',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000), // expired
      user: { userRoles: [] },
    };
    prismaMock.session.findUnique.mockResolvedValue(expiredSession);

    const result = await service.findValidSession(rawToken);
    expect(result).toBeNull();
  });

  it('should revoke session by setting revokedAt timestamp', async () => {
    const rawToken = 'token_to_revoke';
    prismaMock.session.findUnique.mockResolvedValue({ id: 'sess_456', revokedAt: null });
    prismaMock.session.update.mockResolvedValue({});

    const success = await service.revokeSession(rawToken);
    expect(success).toBe(true);
    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: 'sess_456' },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
