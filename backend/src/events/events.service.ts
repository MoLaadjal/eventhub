// src/events/events.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/entities/user.entity';
import { Participation } from './entities/participation.entity';
import { EventStatus } from './enums/event-status.enum';
import { FindEventsDto } from './dto/find-events.dto';

@Injectable()
export class EventsService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateStatus(
    id: string,
    status: EventStatus,
    userId: string,
  ): Promise<Event> {
    const event = await this.findOne(id);

    // Vérifier si l'utilisateur est l'organisateur
    if (event.organizer.id !== userId) {
      throw new ConflictException(
        'Only the organizer can update the event status',
      );
    }

    // Vérifier les transitions de statut valides
    if (!this.isValidStatusTransition(event.status, status)) {
      throw new ConflictException(
        `Cannot transition from ${event.status} to ${status}`,
      );
    }

    event.status = status;
    return this.eventsRepository.save(event);
  }

  private isValidStatusTransition(
    currentStatus: EventStatus,
    newStatus: EventStatus,
  ): boolean {
    const allowedTransitions = {
      [EventStatus.DRAFT]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],
      [EventStatus.PUBLISHED]: [EventStatus.CANCELLED, EventStatus.COMPLETED],
      [EventStatus.CANCELLED]: [],
      [EventStatus.COMPLETED]: [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    organizer: User,
  ): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      organizer,
    });
    return this.eventsRepository.save(event);
  }

  findAll() {
    return this.eventsRepository.find({
      relations: ['organizer'],
    });
  }

  async findOne(id: string) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });

    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id);
    Object.assign(event, updateEventDto);
    return this.eventsRepository.save(event);
  }

  async remove(id: string) {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }

  async addParticipant(
    eventId: string,
    userId: string,
  ): Promise<Participation> {
    const event = await this.findOne(eventId);

    if (event.status !== EventStatus.PUBLISHED) {
      throw new ConflictException('Cannot participate in an unpublished event');
    }

    if (event.currentParticipants >= event.maxParticipants) {
      throw new ConflictException('Event is full');
    }

    const participation = this.participationRepository.create({
      event,
      user: { id: userId },
      status: 'registered',
    });

    await this.eventsRepository.increment(
      { id: eventId },
      'currentParticipants',
      1,
    );

    return this.participationRepository.save(participation);
  }

  async removeParticipant(eventId: string, userId: string): Promise<void> {
    const participation = await this.participationRepository.findOne({
      where: { event: { id: eventId }, user: { id: userId } },
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    await this.participationRepository.remove(participation);
    await this.eventsRepository.decrement(
      { id: eventId },
      'currentParticipants',
      1,
    );
  }

  async getEventParticipants(eventId: string): Promise<Participation[]> {
    return this.participationRepository.find({
      where: { event: { id: eventId } },
      relations: ['user'],
    });
  }

  async findEvents(filters: FindEventsDto): Promise<Event[]> {
    try {
      const queryBuilder = this.eventsRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.organizer', 'organizer');

      if (filters?.search) {
        queryBuilder.where(
          'event.title ILIKE :search OR event.description ILIKE :search',
          { search: `%${filters.search}%` },
        );
      }

      if (filters?.location) {
        const whereClause = filters.search ? 'andWhere' : 'where';
        queryBuilder[whereClause]('event.location ILIKE :location', {
          location: `%${filters.location}%`,
        });
      }

      if (filters?.status) {
        const whereClause =
          filters.search || filters.location ? 'andWhere' : 'where';
        queryBuilder[whereClause]('event.status = :status', {
          status: filters.status,
        });
      }

      if (filters?.dateFrom) {
        if (isNaN(Date.parse(filters.dateFrom))) {
          throw new BadRequestException('Invalid dateFrom format');
        }
        const whereClause =
          filters.search || filters.location || filters.status
            ? 'andWhere'
            : 'where';
        queryBuilder[whereClause]('event.date >= :dateFrom', {
          dateFrom: new Date(filters.dateFrom),
        });
      }

      if (filters?.dateTo) {
        if (isNaN(Date.parse(filters.dateTo))) {
          throw new BadRequestException('Invalid dateTo format');
        }
        const whereClause =
          filters.search ||
          filters.location ||
          filters.status ||
          filters.dateFrom
            ? 'andWhere'
            : 'where';
        queryBuilder[whereClause]('event.date <= :dateTo', {
          dateTo: new Date(filters.dateTo),
        });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in findEvents:', error);
      throw new InternalServerErrorException(
        'An error occurred while searching events',
      );
    }
  }
}