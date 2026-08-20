import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { NotificationType } from '@almosthack/types';

export class NotificationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsUUID()
  hackathonId?: string;
}

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  inAppAnnouncements?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppTeamUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppResults?: boolean;
}
