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
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  ScheduleAnnouncementDto,
  AnnouncementQueryDto,
} from './dto/announcements.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnnouncementEntity } from '@almosthack/types';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('hackathons/:hackathonId/announcements')
@UseGuards(SessionAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a draft announcement for a hackathon' })
  @ApiResponse({ status: 201, description: 'Announcement created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or invalid track' })
  @ApiResponse({ status: 403, description: 'Forbidden if not an organizer of this hackathon' })
  async create(
    @Param('hackathonId', ParseUUIDPipe) hackathonId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateAnnouncementDto
  ): Promise<AnnouncementEntity> {
    return this.announcementsService.createAnnouncement(hackathonId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get announcements for a hackathon' })
  @ApiResponse({ status: 200, description: 'Announcements retrieved successfully' })
  async getAnnouncements(
    @Param('hackathonId', ParseUUIDPipe) hackathonId: string,
    @CurrentUser() user: any,
    @Query() query: AnnouncementQueryDto
  ): Promise<AnnouncementEntity[]> {
    return this.announcementsService.getAnnouncements(hackathonId, user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single announcement detail' })
  @ApiResponse({ status: 200, description: 'Announcement retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden if unpublished and not an organizer' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async getAnnouncement(
    @Param('hackathonId', ParseUUIDPipe) hackathonId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<AnnouncementEntity> {
    return this.announcementsService.getAnnouncement(hackathonId, id, user.id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a draft announcement' })
  @ApiResponse({ status: 200, description: 'Announcement updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden if not an organizer' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  @ApiResponse({ status: 409, description: 'Conflict if already published or cancelled' })
  async update(
    @Param('hackathonId', ParseUUIDPipe) hackathonId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateAnnouncementDto
  ): Promise<AnnouncementEntity> {
    return this.announcementsService.updateAnnouncement(hackathonId, id, user.id, dto);
  }

  @Post(':id/schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule an announcement for future publication' })
  @ApiResponse({ status: 200, description: 'Announcement scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid schedule timestamp (must be in future)' })
  @ApiResponse({ status: 403, description: 'Forbidden if not an organizer' })
  @ApiResponse({ status: 409, description: 'Conflict if already published or cancelled' })
  async schedule(
    @Param('hackathonId', ParseUUIDPipe) hackathonId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: ScheduleAnnouncementDto
  ): Promise<AnnouncementEntity> {
    return this.announcementsService.scheduleAnnouncement(hackathonId, id, user.id, dto);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish an announcement immediately' })
  @ApiResponse({ status: 200, description: 'Announcement published successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden if not an organizer' })
  @ApiResponse({ status: 409, description: 'Conflict if cancelled' })
  async publish(
    @Param('hackathonId', ParseUUIDPipe) hackathonId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<AnnouncementEntity> {
    return this.announcementsService.publishAnnouncement(hackathonId, id, user.id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a scheduled announcement' })
  @ApiResponse({ status: 200, description: 'Announcement cancelled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden if not an organizer' })
  @ApiResponse({ status: 409, description: 'Conflict if already published or cancelled' })
  async cancel(
    @Param('hackathonId', ParseUUIDPipe) hackathonId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<AnnouncementEntity> {
    return this.announcementsService.cancelAnnouncement(hackathonId, id, user.id);
  }
}
