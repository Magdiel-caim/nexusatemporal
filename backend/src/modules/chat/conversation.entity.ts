import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  leadId?: string;

  @Column({ type: 'varchar' })
  contactName: string;

  @Column({ type: 'varchar', unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  whatsappInstanceId?: string; // ID da instância do WhatsApp (para múltiplos números)

  @Column({ type: 'varchar', nullable: true })
  assignedUserId?: string; // Vendedor atribuído

  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'archived' | 'closed' | 'waiting';

  @Column({ type: 'boolean', default: false })
  isUnread: boolean;

  @Column({ type: 'int', default: 0 })
  unreadCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @Column({ type: 'text', nullable: true })
  lastMessagePreview?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Dados adicionais flexíveis

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}

// Import circular dependency
import { Message } from './message.entity';
