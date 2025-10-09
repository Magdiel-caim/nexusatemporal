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

  @Column({ type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ type: 'varchar' })
  direction: 'incoming' | 'outgoing'; // Recebida ou enviada

  @Column({ type: 'varchar' })
  type: 'text' | 'audio' | 'image' | 'video' | 'document' | 'location' | 'contact';

  @Column({ type: 'text', nullable: true })
  content?: string; // Conteúdo da mensagem (texto)

  @Column({ type: 'varchar', nullable: true })
  senderId?: string; // ID do usuário que enviou (se outgoing)

  @Column({ type: 'varchar', nullable: true })
  senderName?: string;

  @Column({ type: 'varchar', nullable: true })
  whatsappMessageId?: string; // ID da mensagem no WhatsApp

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // Dados extras (localização, contato, etc)

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Attachment, (attachment) => attachment.message)
  attachments: Attachment[];
}
