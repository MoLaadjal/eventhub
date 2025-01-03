import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';

@Entity('participations')
export class Participation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Event)
  event: Event;

  @Column({ default: 'registered' })
  status: 'registered' | 'attended' | 'cancelled';

  @CreateDateColumn()
  registeredAt: Date;
}
