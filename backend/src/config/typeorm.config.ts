import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'eventhub',
  password: 'eventhub123',
  database: 'eventhub',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
