import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto, UpdateNotificationPreferenceDto } from './dto/notifications.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginatedNotificationsResponseDto, NotificationEntity, NotificationPreferenceEntity } from '@almosthack/types';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(SessionAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications (paginated)' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @CurrentUser() user: any,
    @Query() query: NotificationQueryDto
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.notificationsService.getUserNotifications(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@CurrentUser() user: any): Promise<{ unreadCount: number }> {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark single notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 403, description: 'Forbidden if notification belongs to another user' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<NotificationEntity> {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all unread notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: any): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences for current user' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved' })
  async getPreferences(@CurrentUser() user: any): Promise<NotificationPreferenceEntity> {
    return this.notificationsService.getUserPreferences(user.id);
  }

  @Patch('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences for current user' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated' })
  async updatePreferences(
    @CurrentUser() user: any,
    @Body() dto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreferenceEntity> {
    return this.notificationsService.updateUserPreferences(user.id, dto);
  }
}
