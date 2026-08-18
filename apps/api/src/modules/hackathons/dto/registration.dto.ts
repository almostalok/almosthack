import { IsOptional, IsUUID } from 'class-validator';

export class CreateParticipantRegistrationDto {
  @IsOptional()
  @IsUUID('4', { message: 'trackId must be a valid UUID' })
  trackId?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'challengeId must be a valid UUID' })
  challengeId?: string | null;
}

export class UpdateParticipantRegistrationDto {
  @IsOptional()
  @IsUUID('4', { message: 'trackId must be a valid UUID' })
  trackId?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'challengeId must be a valid UUID' })
  challengeId?: string | null;
}
