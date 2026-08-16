import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, UserProfileResponse } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permission } from '@almosthack/types';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PROFILE_READ_SELF)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthenticated or session expired' })
  @ApiResponse({ status: 403, description: 'Forbidden if profile read permission missing' })
  async getProfile(@CurrentUser() user: any): Promise<UserProfileResponse> {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.PROFILE_UPDATE_SELF)
  @ApiOperation({ summary: 'Update current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthenticated or session expired' })
  @ApiResponse({ status: 403, description: 'Forbidden if profile update permission missing' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto
  ): Promise<UserProfileResponse> {
    return this.usersService.updateProfile(user.id, dto);
  }
}
