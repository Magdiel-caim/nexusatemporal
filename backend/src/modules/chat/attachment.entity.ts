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

  @Column({ type: 'uuid' })
  messageId: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column({ type: 'varchar' })
  type: 'audio' | 'image' | 'video' | 'document';

  @Column({ type: 'varchar' })
  fileName: string;

  @Column({ type: 'varchar' })
  fileUrl: string; // URL do arquivo (S3/iDrive)

  @Column({ type: 'varchar', nullable: true })
  mimeType?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number; // Tamanho em bytes

  @Column({ type: 'int', nullable: true })
  duration?: number; // Duração em segundos (para áudio/vídeo)

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl?: string;

  @CreateDateColumn()
  createdAt: Date;
}
