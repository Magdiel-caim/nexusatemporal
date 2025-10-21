import { Pool } from 'pg';
import { Vendedor, TipoComissao } from './vendedor.entity';
import { Venda, VendaStatus } from './venda.entity';
import { Comissao, ComissaoStatus } from './comissao.entity';

interface CreateVendedorDTO {
  userId: string;
  percentualComissaoPadrao: number;
  tipoComissao: TipoComissao;
  valorFixoComissao?: number;
  metaMensal?: number;
  dataInicio: Date;
  observacoes?: string;
  tenantId: string;
}

interface CreateVendaDTO {
  vendedorId: string;
  leadId?: string;
  appointmentId?: string;
  procedureId?: string;
  valorBruto: number;
  desconto?: number;
  percentualComissao?: number;
  formaPagamento?: string;
  observacoes?: string;
  tenantId: string;
  createdById?: string;
}

export class VendasService {
  constructor(private db: Pool) {}

  // ============================================
  // VENDEDORES
  // ============================================

  /**
   * Cria um novo vendedor
   */
  async createVendedor(data: CreateVendedorDTO): Promise<Vendedor> {
    // Gerar código do vendedor
    const codigoVendedor = await this.gerarCodigoVendedor(data.tenantId);

    const query = `
      INSERT INTO vendedores (
        codigo_vendedor,
        user_id,
        percentual_comissao_padrao,
        tipo_comissao,
        valor_fixo_comissao,
        meta_mensal,
        ativo,
        data_inicio,
        observacoes,
        tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      codigoVendedor,
      data.userId,
      data.percentualComissaoPadrao,
      data.tipoComissao,
      data.valorFixoComissao || null,
      data.metaMensal || null,
      true,
      data.dataInicio,
      data.observacoes || null,
      data.tenantId,
    ];

    const result = await this.db.query(query, values);
    return this.transformVendedor(result.rows[0]);
  }

  /**
   * Busca vendedor por ID
   */
  async findVendedorById(id: string): Promise<Vendedor | null> {
    const query = `
      SELECT v.*,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM vendedores v
      LEFT JOIN users u ON u.id = v.user_id
      WHERE v.id = $1
    `;

    const result = await this.db.query(query, [id]);
    return result.rows[0] ? this.transformVendedor(result.rows[0]) : null;
  }

  /**
   * Lista todos os vendedores
   */
  async findAllVendedores(tenantId: string): Promise<Vendedor[]> {
    const query = `
      SELECT v.*,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM vendedores v
      LEFT JOIN users u ON u.id = v.user_id
      WHERE v.tenant_id = $1
      ORDER BY v.created_at DESC
    `;

    const result = await this.db.query(query, [tenantId]);
    return result.rows.map((row) => this.transformVendedor(row));
  }

  /**
   * Atualiza vendedor
   */
  async updateVendedor(
    id: string,
    data: Partial<CreateVendedorDTO>
  ): Promise<Vendedor> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.percentualComissaoPadrao !== undefined) {
      fields.push(`percentual_comissao_padrao = $${paramIndex++}`);
      values.push(data.percentualComissaoPadrao);
    }

    if (data.tipoComissao) {
      fields.push(`tipo_comissao = $${paramIndex++}`);
      values.push(data.tipoComissao);
    }

    if (data.valorFixoComissao !== undefined) {
      fields.push(`valor_fixo_comissao = $${paramIndex++}`);
      values.push(data.valorFixoComissao);
    }

    if (data.metaMensal !== undefined) {
      fields.push(`meta_mensal = $${paramIndex++}`);
      values.push(data.metaMensal);
    }

    if (data.observacoes !== undefined) {
      fields.push(`observacoes = $${paramIndex++}`);
      values.push(data.observacoes);
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE vendedores
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);

    const result = await this.db.query(query, values);
    return this.transformVendedor(result.rows[0]);
  }

  /**
   * Desativa vendedor
   */
  async desativarVendedor(id: string): Promise<void> {
    const query = `
      UPDATE vendedores
      SET ativo = false, data_fim = NOW()
      WHERE id = $1
    `;

    await this.db.query(query, [id]);
  }

  // ============================================
  // VENDAS
  // ============================================

  /**
   * Cria uma nova venda
   */
  async createVenda(data: CreateVendaDTO): Promise<Venda> {
    // Buscar vendedor para pegar percentual de comissão
    const vendedor = await this.findVendedorById(data.vendedorId);
    if (!vendedor) {
      throw new Error('Vendedor não encontrado');
    }

    // Calcular valores
    const valorLiquido = data.valorBruto - (data.desconto || 0);
    const percentualComissao =
      data.percentualComissao || vendedor.percentualComissaoPadrao;
    const valorComissao = vendedor.calcularComissao(valorLiquido);

    // Gerar número da venda
    const numeroVenda = await this.gerarNumeroVenda(data.tenantId);

    const query = `
      INSERT INTO vendas (
        numero_venda,
        vendedor_id,
        lead_id,
        appointment_id,
        procedure_id,
        valor_bruto,
        desconto,
        valor_liquido,
        percentual_comissao,
        valor_comissao,
        data_venda,
        status,
        forma_pagamento,
        observacoes,
        tenant_id,
        created_by_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      numeroVenda,
      data.vendedorId,
      data.leadId || null,
      data.appointmentId || null,
      data.procedureId || null,
      data.valorBruto,
      data.desconto || 0,
      valorLiquido,
      percentualComissao,
      valorComissao,
      new Date(),
      VendaStatus.PENDENTE,
      data.formaPagamento || null,
      data.observacoes || null,
      data.tenantId,
      data.createdById || null,
    ];

    const result = await this.db.query(query, values);
    return this.transformVenda(result.rows[0]);
  }

  /**
   * Confirma uma venda (gera comissão)
   */
  async confirmarVenda(vendaId: string): Promise<Venda> {
    const venda = await this.findVendaById(vendaId);
    if (!venda) {
      throw new Error('Venda não encontrada');
    }

    if (venda.status === VendaStatus.CONFIRMADA) {
      throw new Error('Venda já está confirmada');
    }

    // Atualizar venda
    const query = `
      UPDATE vendas
      SET status = $1, data_confirmacao = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.db.query(query, [
      VendaStatus.CONFIRMADA,
      vendaId,
    ]);

    const vendaAtualizada = this.transformVenda(result.rows[0]);

    // Gerar comissão automaticamente
    await this.gerarComissao(vendaAtualizada);

    return vendaAtualizada;
  }

  /**
   * Cancela uma venda
   */
  async cancelarVenda(vendaId: string, motivo: string): Promise<Venda> {
    const query = `
      UPDATE vendas
      SET status = $1, data_cancelamento = NOW(), motivo_cancelamento = $2
      WHERE id = $3
      RETURNING *
    `;

    const result = await this.db.query(query, [
      VendaStatus.CANCELADA,
      motivo,
      vendaId,
    ]);

    // Cancelar comissões relacionadas
    await this.cancelarComissoesPorVenda(vendaId);

    return this.transformVenda(result.rows[0]);
  }

  /**
   * Busca venda por ID
   */
  async findVendaById(id: string): Promise<Venda | null> {
    const query = `
      SELECT v.*,
             vend.codigo_vendedor, vend.percentual_comissao_padrao,
             l.name as lead_name,
             p.name as procedure_name
      FROM vendas v
      LEFT JOIN vendedores vend ON vend.id = v.vendedor_id
      LEFT JOIN leads l ON l.id = v.lead_id
      LEFT JOIN procedures p ON p.id = v.procedure_id
      WHERE v.id = $1
    `;

    const result = await this.db.query(query, [id]);
    return result.rows[0] ? this.transformVenda(result.rows[0]) : null;
  }

  /**
   * Lista vendas com filtros
   */
  async findAllVendas(
    tenantId: string,
    filters?: {
      vendedorId?: string;
      status?: VendaStatus;
      dataInicio?: Date;
      dataFim?: Date;
    }
  ): Promise<Venda[]> {
    let query = `
      SELECT v.*,
             vend.codigo_vendedor,
             l.name as lead_name
      FROM vendas v
      LEFT JOIN vendedores vend ON vend.id = v.vendedor_id
      LEFT JOIN leads l ON l.id = v.lead_id
      WHERE v.tenant_id = $1
    `;

    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.vendedorId) {
      query += ` AND v.vendedor_id = $${paramIndex++}`;
      values.push(filters.vendedorId);
    }

    if (filters?.status) {
      query += ` AND v.status = $${paramIndex++}`;
      values.push(filters.status);
    }

    if (filters?.dataInicio) {
      query += ` AND v.data_venda >= $${paramIndex++}`;
      values.push(filters.dataInicio);
    }

    if (filters?.dataFim) {
      query += ` AND v.data_venda <= $${paramIndex++}`;
      values.push(filters.dataFim);
    }

    query += ` ORDER BY v.data_venda DESC`;

    const result = await this.db.query(query, values);
    return result.rows.map((row) => this.transformVenda(row));
  }

  /**
   * Estatísticas de vendas
   */
  async getVendasStats(tenantId: string, vendedorId?: string): Promise<any> {
    let query = `
      SELECT
        COUNT(*) as total_vendas,
        COUNT(*) FILTER (WHERE status = 'confirmada') as vendas_confirmadas,
        COUNT(*) FILTER (WHERE status = 'pendente') as vendas_pendentes,
        COUNT(*) FILTER (WHERE status = 'cancelada') as vendas_canceladas,
        COALESCE(SUM(valor_liquido) FILTER (WHERE status = 'confirmada'), 0) as valor_total,
        COALESCE(AVG(valor_liquido) FILTER (WHERE status = 'confirmada'), 0) as ticket_medio
      FROM vendas
      WHERE tenant_id = $1
    `;

    const values: any[] = [tenantId];

    if (vendedorId) {
      query += ` AND vendedor_id = $2`;
      values.push(vendedorId);
    }

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // ============================================
  // COMISSÕES
  // ============================================

  /**
   * Gera comissão a partir de uma venda confirmada
   */
  private async gerarComissao(venda: Venda): Promise<Comissao> {
    const dataConfirmacao = venda.dataConfirmacao || new Date();
    const mesCompetencia = dataConfirmacao.getMonth() + 1;
    const anoCompetencia = dataConfirmacao.getFullYear();

    const query = `
      INSERT INTO comissoes (
        venda_id,
        vendedor_id,
        valor_base_calculo,
        percentual_aplicado,
        valor_comissao,
        mes_competencia,
        ano_competencia,
        status,
        tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      venda.id,
      venda.vendedorId,
      venda.valorLiquido,
      venda.percentualComissao,
      venda.valorComissao,
      mesCompetencia,
      anoCompetencia,
      ComissaoStatus.PENDENTE,
      venda.tenantId,
    ];

    const result = await this.db.query(query, values);
    return this.transformComissao(result.rows[0]);
  }

  /**
   * Cancela comissões de uma venda
   */
  private async cancelarComissoesPorVenda(vendaId: string): Promise<void> {
    const query = `
      UPDATE comissoes
      SET status = $1
      WHERE venda_id = $2 AND status = $3
    `;

    await this.db.query(query, [
      ComissaoStatus.CANCELADA,
      vendaId,
      ComissaoStatus.PENDENTE,
    ]);
  }

  // ============================================
  // UTILITÁRIOS
  // ============================================

  /**
   * Gera código único do vendedor
   */
  private async gerarCodigoVendedor(tenantId: string): Promise<string> {
    const ano = new Date().getFullYear();

    const query = `
      SELECT codigo_vendedor
      FROM vendedores
      WHERE tenant_id = $1 AND codigo_vendedor LIKE $2
      ORDER BY codigo_vendedor DESC
      LIMIT 1
    `;

    const result = await this.db.query(query, [tenantId, `VND-${ano}-%`]);

    let numero = 1;
    if (result.rows.length > 0) {
      const ultimoCodigo = result.rows[0].codigo_vendedor;
      const match = ultimoCodigo.match(/VND-\d{4}-(\d+)/);
      if (match) {
        numero = parseInt(match[1]) + 1;
      }
    }

    return `VND-${ano}-${numero.toString().padStart(4, '0')}`;
  }

  /**
   * Gera número único da venda
   */
  private async gerarNumeroVenda(tenantId: string): Promise<string> {
    const ano = new Date().getFullYear();

    const query = `
      SELECT numero_venda
      FROM vendas
      WHERE tenant_id = $1 AND numero_venda LIKE $2
      ORDER BY numero_venda DESC
      LIMIT 1
    `;

    const result = await this.db.query(query, [tenantId, `VND-${ano}-%`]);

    let numero = 1;
    if (result.rows.length > 0) {
      const ultimoNumero = result.rows[0].numero_venda;
      const match = ultimoNumero.match(/VND-\d{4}-(\d+)/);
      if (match) {
        numero = parseInt(match[1]) + 1;
      }
    }

    return `VND-${ano}-${numero.toString().padStart(4, '0')}`;
  }

  /**
   * Transforma row do DB para Vendedor
   */
  private transformVendedor(row: any): Vendedor {
    return {
      id: row.id,
      codigoVendedor: row.codigo_vendedor,
      userId: row.user_id,
      percentualComissaoPadrao: parseFloat(row.percentual_comissao_padrao),
      tipoComissao: row.tipo_comissao,
      valorFixoComissao: row.valor_fixo_comissao
        ? parseFloat(row.valor_fixo_comissao)
        : null,
      metaMensal: row.meta_mensal ? parseFloat(row.meta_mensal) : null,
      ativo: row.ativo,
      dataInicio: row.data_inicio,
      dataFim: row.data_fim,
      observacoes: row.observacoes,
      tenantId: row.tenant_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as Vendedor;
  }

  /**
   * Transforma row do DB para Venda
   */
  private transformVenda(row: any): Venda {
    return {
      id: row.id,
      numeroVenda: row.numero_venda,
      vendedorId: row.vendedor_id,
      leadId: row.lead_id,
      appointmentId: row.appointment_id,
      procedureId: row.procedure_id,
      valorBruto: parseFloat(row.valor_bruto),
      desconto: parseFloat(row.desconto),
      valorLiquido: parseFloat(row.valor_liquido),
      percentualComissao: row.percentual_comissao
        ? parseFloat(row.percentual_comissao)
        : null,
      valorComissao: row.valor_comissao ? parseFloat(row.valor_comissao) : null,
      dataVenda: row.data_venda,
      dataConfirmacao: row.data_confirmacao,
      dataCancelamento: row.data_cancelamento,
      status: row.status,
      motivoCancelamento: row.motivo_cancelamento,
      transactionId: row.transaction_id,
      formaPagamento: row.forma_pagamento,
      observacoes: row.observacoes,
      metadata: row.metadata,
      tenantId: row.tenant_id,
      createdById: row.created_by_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as Venda;
  }

  /**
   * Transforma row do DB para Comissao
   */
  private transformComissao(row: any): Comissao {
    return {
      id: row.id,
      vendaId: row.venda_id,
      vendedorId: row.vendedor_id,
      valorBaseCalculo: parseFloat(row.valor_base_calculo),
      percentualAplicado: parseFloat(row.percentual_aplicado),
      valorComissao: parseFloat(row.valor_comissao),
      mesCompetencia: row.mes_competencia,
      anoCompetencia: row.ano_competencia,
      status: row.status,
      dataPagamento: row.data_pagamento,
      transactionId: row.transaction_id,
      observacoes: row.observacoes,
      tenantId: row.tenant_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as Comissao;
  }
}
