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

  @Column({ name: 'lead_id', type: 'varchar', nullable: true })
  leadId?: string;

  @Column({ name: 'contact_name', type: 'varchar' })
  contactName: string;

  @Column({ name: 'phone_number', type: 'varchar' })
  phoneNumber: string;

  @Column({ name: 'whatsapp_instance_id', type: 'varchar', nullable: true })
  whatsappInstanceId?: string; // ID da instância do WhatsApp (para múltiplos números)

  @Column({ name: 'assigned_user_id', type: 'varchar', nullable: true })
  assignedUserId?: string; // Vendedor atribuído

  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'archived' | 'closed' | 'waiting';

  @Column({ name: 'is_unread', type: 'boolean', default: false })
  isUnread: boolean;

  @Column({ name: 'unread_count', type: 'int', default: 0 })
  unreadCount: number;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @Column({ name: 'last_message_preview', type: 'text', nullable: true })
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
