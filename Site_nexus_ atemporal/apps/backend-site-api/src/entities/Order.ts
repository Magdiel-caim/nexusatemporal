import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_email: string;

  @Column({ type: 'text', nullable: true })
  user_name: string;

  @Column({ type: 'text', nullable: true })
  plan: string;

  @Column({ type: 'integer', nullable: true })
  amount: number;

  @Column({ type: 'text', nullable: true })
  provider: string; // stripe, asaas, pagseguro

  @Column({ type: 'text', default: 'pending' })
  status: string; // pending, paid, failed, cancelled

  @Column({ type: 'text', nullable: true })
  external_id: string; // ID do gateway de pagamento

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
