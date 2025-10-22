import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id', type: 'uuid' })
  messageId: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ type: 'varchar' })
  type: 'audio' | 'image' | 'video' | 'document';

  @Column({ name: 'file_name', type: 'varchar' })
  fileName: string;

  @Column({ name: 'file_url', type: 'varchar' })
  fileUrl: string; // URL do arquivo (S3/iDrive)

  @Column({ name: 'mime_type', type: 'varchar', nullable: true })
  mimeType?: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number; // Tamanho em bytes

  @Column({ type: 'int', nullable: true })
  duration?: number; // Duração em segundos (para áudio/vídeo)

  @Column({ name: 'thumbnail_url', type: 'varchar', nullable: true })
  thumbnailUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
