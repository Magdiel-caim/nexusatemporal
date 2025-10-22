import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Attachment } from './attachment.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ type: 'varchar' })
  direction: 'incoming' | 'outgoing'; // Recebida ou enviada

  @Column({ type: 'varchar' })
  type: 'text' | 'audio' | 'image' | 'video' | 'document' | 'location' | 'contact';

  @Column({ type: 'text', nullable: true })
  content?: string; // Conteúdo da mensagem (texto)

  @Column({ name: 'sender_id', type: 'varchar', nullable: true })
  senderId?: string; // ID do usuário que enviou (se outgoing)

  @Column({ name: 'sender_name', type: 'varchar', nullable: true })
  senderName?: string;

  @Column({ name: 'whatsapp_message_id', type: 'varchar', nullable: true })
  whatsappMessageId?: string; // ID da mensagem no WhatsApp

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Dados extras (localização, contato, etc)

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Attachment, (attachment) => attachment.message)
  attachments: Attachment[];
}
