import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AnnouncementStatus, AnnouncementRecipientScope } from '@almosthack/types';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10000)
  body!: string;

  @IsOptional()
  @IsEnum(AnnouncementRecipientScope)
  recipientScope?: AnnouncementRecipientScope;

  @IsOptional()
  @IsUUID()
  targetTrackId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(10000)
  body?: string;

  @IsOptional()
  @IsEnum(AnnouncementRecipientScope)
  recipientScope?: AnnouncementRecipientScope;

  @IsOptional()
  @IsUUID()
  targetTrackId?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ScheduleAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  scheduledAt!: string;
}

export class AnnouncementQueryDto {
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  @IsOptional()
  @IsUUID()
  targetTrackId?: string;
}
