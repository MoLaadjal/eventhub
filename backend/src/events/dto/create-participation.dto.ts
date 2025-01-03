import { IsUUID } from 'class-validator';

export class CreateParticipationDto {
  @IsUUID()
  eventId: string;
}
