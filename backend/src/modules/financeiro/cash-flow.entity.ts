import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

export enum CashFlowType {
  ABERTURA = 'abertura',
  FECHAMENTO = 'fechamento',
  SANGRIA = 'sangria',
  REFORCO = 'reforco',
}

@Entity('cash_flow')
export class CashFlow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: Date;

  @Column({
    type: 'enum',
    enum: CashFlowType,
    nullable: true,
  })
  type: CashFlowType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalIncome: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalExpense: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  closingBalance: number;

  // Detalhamento por forma de pagamento
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cashAmount: number; // Dinheiro

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pixAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  creditCardAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  debitCardAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  transferAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  otherAmount: number;

  // Sangrias e reforços
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  withdrawals: number; // Sangrias

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deposits: number; // Reforços

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  isClosed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  closedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'closedById' })
  closedBy: User;

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar', nullable: true })
  openedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'openedById' })
  openedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  openedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
