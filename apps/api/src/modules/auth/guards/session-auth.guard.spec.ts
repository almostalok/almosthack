import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionService } from '../session.service';

describe('SessionAuthGuard', () => {
  let guard: SessionAuthGuard;
  let sessionServiceMock: any;

  beforeEach(async () => {
    sessionServiceMock = {
      findValidSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionAuthGuard,
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    }).compile();

    guard = module.get<SessionAuthGuard>(SessionAuthGuard);
  });

  it('should throw UnauthorizedException when session cookie is missing', async () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
          headers: {},
        }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should attach user to request when session cookie is valid', async () => {
    const mockUser = {
      id: 'usr_777',
      email: 'test@almosthack.org',
      name: 'Test User',
      avatarUrl: null,
      bio: null,
      githubUsername: null,
      userRoles: [{ role: { name: 'PARTICIPANT' } }],
    };

    sessionServiceMock.findValidSession.mockResolvedValue({
      id: 'sess_111',
      user: mockUser,
    });

    const mockRequest: any = {
      cookies: { almosthack_session: 'valid_cookie_token' },
      headers: {},
    };

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    };

    const canActivate = await guard.canActivate(mockContext);

    expect(canActivate).toBe(true);
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.id).toBe('usr_777');
    expect(mockRequest.user.roles).toEqual(['PARTICIPANT']);
  });
});
