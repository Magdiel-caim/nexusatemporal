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

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl?: string; // Foto do perfil do contato WhatsApp

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

  // TEMPORARIAMENTE REMOVIDO - Colunas existem no DB mas TypeORM não sincroniza em produção
  // Reativar quando configurar migrations corretamente
  // @Column({ type: 'boolean', default: false, nullable: true })
  // archived?: boolean;

  // @Column({ type: 'enum', enum: ['low', 'medium', 'high'], nullable: true })
  // priority?: 'low' | 'medium' | 'high';

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Dados adicionais flexíveis

  // ===== NOVOS CAMPOS v128 =====

  @Column({ type: 'simple-array', nullable: true })
  participants?: string[]; // IDs dos participantes (atendentes) na conversa

  @Column({ type: 'jsonb', nullable: true })
  activityLog?: Array<{
    type: 'assigned' | 'unassigned' | 'tagged' | 'archived' | 'reopened';
    userId: string;
    userName: string;
    timestamp: string;
    details?: any;
  }>; // Histórico de atividades da conversa

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}

// Import circular dependency
import { Message } from './message.entity';
