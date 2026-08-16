import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { PrismaService } from '../../database/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: any;
  let sessionServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    sessionServiceMock = {
      createSession: jest.fn(),
      revokeAllUserSessions: jest.fn(),
      revokeSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should throw ConflictException on registering duplicate email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_existing' });

    await expect(
      service.register({
        email: 'duplicate@test.com',
        name: 'Duplicate User',
        password: 'Password123!',
      })
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException with INVALID_CREDENTIALS for nonexistent user login', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'nobody@test.com',
        password: 'Password123!',
      })
    ).rejects.toThrow(UnauthorizedException);
  });
});
