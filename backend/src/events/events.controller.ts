import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { EventsService } from './events.service';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Permission } from 'src/auth/enums/permission.enum';
import { Role } from 'src/auth/enums/role.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from './enums/event-status.enum';
import { FindEventsDto } from './dto/find-events.dto';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @RequirePermissions(Permission.CREATE_EVENTS)
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user);
  }

  @Get()
  @RequirePermissions(Permission.READ_EVENTS)
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('search')
  @RequirePermissions(Permission.READ_EVENTS)
  async searchEvents(@Query() filters: FindEventsDto) {
    return this.eventsService.findEvents(filters);
  }

  @Get(':id')
  @RequirePermissions(Permission.READ_EVENTS)
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @RequirePermissions(Permission.UPDATE_EVENTS)
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  @RequirePermissions(Permission.UPDATE_EVENTS)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EventStatus,
    @Request() req,
  ) {
    return this.eventsService.updateStatus(id, status, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.DELETE_EVENTS)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/participate')
  @Roles(Role.PARTICIPANT)
  async participate(@Param('id') id: string, @Request() req) {
    return this.eventsService.addParticipant(id, req.user.id);
  }

  @Delete(':id/participate')
  @Roles(Role.PARTICIPANT)
  async cancelParticipation(@Param('id') id: string, @Request() req) {
    return this.eventsService.removeParticipant(id, req.user.id);
  }

  @Get(':id/participants')
  @Roles(Role.ADMIN, Role.ORGANIZER)
  async getParticipants(@Param('id') id: string) {
    return this.eventsService.getEventParticipants(id);
  }
}
