// src/events/events.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/entities/user.entity';
import { Participation } from './entities/participation.entity';

@Injectable()
export class EventsService {
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
}
