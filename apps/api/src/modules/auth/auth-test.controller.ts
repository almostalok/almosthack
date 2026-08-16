import {
  Controller,
  Get,
  UseGuards,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequireRoles, RequireRolesWithOptions } from './decorators/roles.decorator';
import {
  RequirePermissions,
  RequirePermissionsWithOptions,
} from './decorators/permissions.decorator';
import { RequireScope } from './decorators/scope.decorator';
import { RoleName, Permission, ScopeType } from '@almosthack/types';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth Test (Dev/Test Only)')
@ApiBearerAuth()
@Controller('auth/test')
export class AuthTestController {
  private ensureDevOnly() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Test endpoints are disabled in production environment.');
    }
  }

  @Get('authenticated')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Demonstrate authenticated endpoint' })
  getAuthenticatedTest(@CurrentUser() user: any) {
    this.ensureDevOnly();
    return {
      status: 'success',
      message: 'Access granted to authenticated user',
      userId: user.id,
      roles: user.roles,
    };
  }

  @Get('admin-only')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequireRoles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Demonstrate role required (ADMIN)' })
  getAdminOnlyTest(@CurrentUser() user: any) {
    this.ensureDevOnly();
    return {
      status: 'success',
      message: 'Access granted to ADMIN user',
      userId: user.id,
    };
  }

  @Get('organizer-only')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequireRoles(RoleName.ORGANIZER)
  @ApiOperation({ summary: 'Demonstrate role required (ORGANIZER)' })
  getOrganizerOnlyTest(@CurrentUser() user: any) {
    this.ensureDevOnly();
    return {
      status: 'success',
      message: 'Access granted to ORGANIZER user',
      userId: user.id,
    };
  }

  @Get('permission-required')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_HEALTH_READ)
  @ApiOperation({ summary: 'Demonstrate permission required (SYSTEM_HEALTH_READ)' })
  getPermissionRequiredTest(@CurrentUser() user: any) {
    this.ensureDevOnly();
    return {
      status: 'success',
      message: 'Access granted with permission SYSTEM_HEALTH_READ',
      userId: user.id,
    };
  }

  @Get('multiple-roles-or')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequireRolesWithOptions([RoleName.ORGANIZER, RoleName.JUDGE], { mode: 'OR' })
  @ApiOperation({ summary: 'Demonstrate multiple roles OR semantics (ORGANIZER or JUDGE)' })
  getMultipleRolesOrTest(@CurrentUser() user: any) {
    this.ensureDevOnly();
    return {
      status: 'success',
      message: 'Access granted for ORGANIZER or JUDGE role',
      userId: user.id,
    };
  }

  @Get('multiple-permissions-and')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissionsWithOptions(
    [Permission.PROFILE_READ_SELF, Permission.PROFILE_UPDATE_SELF],
    { mode: 'AND' }
  )
  @ApiOperation({
    summary: 'Demonstrate multiple permissions AND semantics (PROFILE_READ_SELF & PROFILE_UPDATE_SELF)',
  })
  getMultiplePermissionsAndTest(@CurrentUser() user: any) {
    this.ensureDevOnly();
    return {
      status: 'success',
      message: 'Access granted with both PROFILE_READ_SELF and PROFILE_UPDATE_SELF permissions',
      userId: user.id,
    };
  }

  @Get('scope-contract/:hackathonId')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.HACKATHON_VIEW)
  @RequireScope(ScopeType.HACKATHON, 'hackathonId')
  @ApiOperation({ summary: 'Demonstrate future scope contract representation' })
  getScopeContractTest(
    @CurrentUser() user: any,
    @Param('hackathonId') hackathonId: string
  ) {
    this.ensureDevOnly();
    return {
      status: 'success',
      message: 'Access granted under HACKATHON scope contract',
      userId: user.id,
      scope: {
        type: ScopeType.HACKATHON,
        id: hackathonId,
      },
    };
  }
}
