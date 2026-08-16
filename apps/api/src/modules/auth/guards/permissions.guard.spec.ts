import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import { AuthorizationService } from '../authorization.service';
import { RoleName, Permission } from '@almosthack/types';
import { PERMISSIONS_KEY, PERMISSIONS_MODE_KEY } from '../decorators/permissions.decorator';
import { ROLES_KEY, ROLES_MODE_KEY } from '../decorators/roles.decorator';


describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflectorMock: any;
  let authServiceMock: any;

  beforeEach(async () => {
    reflectorMock = {
      getAllAndOverride: jest.fn(),
    };

    authServiceMock = {
      evaluateRoles: jest.fn(),
      evaluatePermissions: jest.fn(),
      can: jest.fn(),
      logDenied: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        { provide: Reflector, useValue: reflectorMock },
        { provide: AuthorizationService, useValue: authServiceMock },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
  });

  const createMockContext = (user?: any, params: any = {}): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params,
          url: '/test-route',
          method: 'GET',
        }),
      }),
    } as any;
  };

  it('should allow access if no authorization metadata is defined', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({ id: 'u1', roles: [RoleName.PARTICIPANT] });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is missing and metadata is set', async () => {
    reflectorMock.getAllAndOverride.mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return [Permission.PROFILE_READ_SELF];
      return undefined;
    });

    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should evaluate role requirements correctly', async () => {
    reflectorMock.getAllAndOverride.mockImplementation((key) => {
      if (key === ROLES_KEY) return [RoleName.ADMIN];
      if (key === ROLES_MODE_KEY) return 'OR';
      return undefined;
    });

    authServiceMock.evaluateRoles.mockReturnValue(true);

    const user = { id: 'u1', roles: [RoleName.ADMIN] };
    const context = createMockContext(user);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(authServiceMock.evaluateRoles).toHaveBeenCalledWith(
      user,
      [RoleName.ADMIN],
      'OR'
    );
  });

  it('should throw ForbiddenException when role check fails', async () => {
    reflectorMock.getAllAndOverride.mockImplementation((key) => {
      if (key === ROLES_KEY) return [RoleName.ADMIN];
      return undefined;
    });

    authServiceMock.evaluateRoles.mockReturnValue(false);

    const user = { id: 'u1', roles: [RoleName.PARTICIPANT] };
    const context = createMockContext(user);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(authServiceMock.logDenied).toHaveBeenCalled();
  });

  it('should evaluate permission requirements correctly', async () => {
    reflectorMock.getAllAndOverride.mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return [Permission.PROFILE_READ_SELF];
      if (key === PERMISSIONS_MODE_KEY) return 'AND';
      return undefined;
    });

    authServiceMock.evaluatePermissions.mockReturnValue(true);
    authServiceMock.can.mockReturnValue(true);

    const user = { id: 'u1', roles: [RoleName.PARTICIPANT] };
    const context = createMockContext(user);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
