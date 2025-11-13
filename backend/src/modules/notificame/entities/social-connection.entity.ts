import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from 'typeorm';

export type PlatformType = 'instagram' | 'facebook' | 'whatsapp';
export type ConnectionStatus = 'active' | 'expired' | 'disconnected' | 'error';

@Entity('notificame_social_connections')
@Index(['cliente_id', 'platform', 'connection_status'])
export class SocialConnection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Relacionamento com sistema existente
    @Column({ type: 'uuid' })
    @Index()
    cliente_id: string;

    @Column({ type: 'uuid' })
    @Index()
    empresa_id: string;

    // Tipo de rede social
    @Column({ type: 'varchar', length: 20 })
    @Index()
    platform: PlatformType;

    // Dados da plataforma
    @Column({ type: 'varchar', length: 255 })
    platform_user_id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    platform_username?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    platform_page_id?: string;

    // Tokens OAuth (SEMPRE CRIPTOGRAFADOS)
    @Column({ type: 'text' })
    access_token_encrypted: string;

    @Column({ type: 'text', nullable: true })
    refresh_token_encrypted?: string;

    @Column({ type: 'timestamp with time zone', nullable: true })
    @Index()
    token_expires_at?: Date;

    // Dados do Notifica.me
    @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
    @Index()
    notificame_channel_id?: string;

    @Column({ type: 'varchar', length: 50, default: 'active' })
    notificame_channel_status: string;

    // Status da conexão
    @Column({ type: 'varchar', length: 50, default: 'active' })
    @Index()
    connection_status: ConnectionStatus;

    @Column({ type: 'timestamp with time zone', nullable: true })
    last_sync_at?: Date;

    // Permissões concedidas pelo usuário
    @Column({ type: 'jsonb', default: '[]' })
    granted_permissions: string[];

    // Metadados adicionais
    @Column({ type: 'jsonb', default: '{}' })
    metadata: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    error_log?: string;

    // Auditoria
    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;

    @Column({ type: 'uuid', nullable: true })
    created_by?: string;
}
