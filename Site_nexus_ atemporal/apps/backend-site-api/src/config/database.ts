import { DataSource } from 'typeorm';
import { Order } from '../entities/Order';
import { PaymentEvent } from '../entities/PaymentEvent';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'nexus_crm',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Order, PaymentEvent],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
