import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './Order';

@Entity('payment_events')
export class PaymentEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'text' })
  provider: string;

  @Column({ type: 'text', nullable: true })
  event_type: string;

  @Column({ type: 'jsonb' })
  event: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
