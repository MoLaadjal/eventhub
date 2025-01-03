import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { EventStatus } from '../enums/event-status.enum';

export class FindEventsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
