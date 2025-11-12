import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { SocialConnection } from './social-connection.entity';

@Entity('notificame_webhook_logs')
export class WebhookLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Relacionamento
    @Column({ type: 'uuid', nullable: true })
    @Index()
    connection_id?: string;

    @ManyToOne(() => SocialConnection, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'connection_id' })
    connection?: SocialConnection;

    // Tipo de evento
    @Column({ type: 'varchar', length: 100 })
    @Index()
    event_type: string; // 'message', 'status', 'error', etc

    @Column({ type: 'varchar', length: 20 })
    @Index()
    platform: string;

    // Dados do webhook
    @Column({ type: 'jsonb' })
    payload: Record<string, any>;

    // Processamento
    @Column({ type: 'boolean', default: false })
    @Index()
    processed: boolean;

    @Column({ type: 'timestamp with time zone', nullable: true })
    processed_at?: Date;

    @Column({ type: 'text', nullable: true })
    processing_error?: string;

    @Column({ type: 'integer', default: 0 })
    retry_count: number;

    // Auditoria
    @CreateDateColumn({ type: 'timestamp with time zone' })
    @Index()
    created_at: Date;
}
