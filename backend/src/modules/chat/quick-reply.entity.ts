import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quick_replies')
export class QuickReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string; // Nome do template (ex: "Saudação Inicial")

  @Column({ type: 'text' })
  content: string; // Conteúdo da resposta rápida

  @Column({ type: 'varchar', nullable: true })
  shortcut?: string; // Atalho para digitar rápido (ex: "/oi")

  @Column({ type: 'varchar', nullable: true })
  category?: string; // Categoria (ex: "Saudações", "Agendamento")

  @Column({ type: 'varchar', nullable: true })
  createdBy?: string; // ID do usuário que criou

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isGlobal: boolean; // Se é global ou específico do usuário

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
