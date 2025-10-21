import { Pool } from 'pg';
import { Comissao, ComissaoStatus } from './comissao.entity';

interface RelatorioMensalDTO {
  vendedorId: string;
  mes: number; // 1-12
  ano: number;
  tenantId: string;
}

interface ComissaoRelatorio {
  vendedor: {
    id: string;
    codigoVendedor: string;
    nome: string;
  };
  periodo: {
    mes: number;
    ano: number;
    descricao: string;
  };
  resumo: {
    totalComissoes: number;
    totalPendente: number;
    totalPago: number;
    totalCancelado: number;
    valorTotal: number;
    valorPendente: number;
    valorPago: number;
  };
  comissoes: Comissao[];
}

export class ComissaoService {
  constructor(private db: Pool) {}

  /**
   * Lista todas as comissões com filtros
   */
  async findAll(
    tenantId: string,
    filters?: {
      vendedorId?: string;
      status?: ComissaoStatus;
      mes?: number;
      ano?: number;
    }
  ): Promise<Comissao[]> {
    let query = `
      SELECT c.*,
             v.numero_venda,
             vend.codigo_vendedor, vend.percentual_comissao_padrao,
             u.name as vendedor_nome
      FROM comissoes c
      LEFT JOIN vendas v ON v.id = c.venda_id
      LEFT JOIN vendedores vend ON vend.id = c.vendedor_id
      LEFT JOIN users u ON u.id = vend.user_id
      WHERE c.tenant_id = $1
    `;

    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.vendedorId) {
      query += ` AND c.vendedor_id = $${paramIndex++}`;
      values.push(filters.vendedorId);
    }

    if (filters?.status) {
      query += ` AND c.status = $${paramIndex++}`;
      values.push(filters.status);
    }

    if (filters?.mes) {
      query += ` AND c.mes_competencia = $${paramIndex++}`;
      values.push(filters.mes);
    }

    if (filters?.ano) {
      query += ` AND c.ano_competencia = $${paramIndex++}`;
      values.push(filters.ano);
    }

    query += ` ORDER BY c.ano_competencia DESC, c.mes_competencia DESC, c.created_at DESC`;

    const result = await this.db.query(query, values);
    return result.rows.map((row) => this.transformComissao(row));
  }

  /**
   * Busca comissão por ID
   */
  async findById(id: string): Promise<Comissao | null> {
    const query = `
      SELECT c.*,
             v.numero_venda, v.valor_liquido as venda_valor,
             vend.codigo_vendedor,
             u.name as vendedor_nome
      FROM comissoes c
      LEFT JOIN vendas v ON v.id = c.venda_id
      LEFT JOIN vendedores vend ON vend.id = c.vendedor_id
      LEFT JOIN users u ON u.id = vend.user_id
      WHERE c.id = $1
    `;

    const result = await this.db.query(query, [id]);
    return result.rows[0] ? this.transformComissao(result.rows[0]) : null;
  }

  /**
   * Marca comissão como paga
   */
  async marcarComoPaga(
    id: string,
    transactionId?: string
  ): Promise<Comissao> {
    const query = `
      UPDATE comissoes
      SET status = $1,
          data_pagamento = NOW(),
          transaction_id = $2
      WHERE id = $3
      RETURNING *
    `;

    const result = await this.db.query(query, [
      ComissaoStatus.PAGA,
      transactionId || null,
      id,
    ]);

    if (result.rows.length === 0) {
      throw new Error('Comissão não encontrada');
    }

    return this.transformComissao(result.rows[0]);
  }

  /**
   * Gera relatório mensal de comissões de um vendedor
   */
  async gerarRelatorioMensal(
    data: RelatorioMensalDTO
  ): Promise<ComissaoRelatorio> {
    // Buscar dados do vendedor
    const vendedorQuery = `
      SELECT v.id, v.codigo_vendedor, u.name
      FROM vendedores v
      LEFT JOIN users u ON u.id = v.user_id
      WHERE v.id = $1 AND v.tenant_id = $2
    `;

    const vendedorResult = await this.db.query(vendedorQuery, [
      data.vendedorId,
      data.tenantId,
    ]);

    if (vendedorResult.rows.length === 0) {
      throw new Error('Vendedor não encontrado');
    }

    const vendedor = vendedorResult.rows[0];

    // Buscar comissões do período
    const comissoesQuery = `
      SELECT c.*,
             v.numero_venda, v.valor_liquido as venda_valor, v.data_confirmacao
      FROM comissoes c
      LEFT JOIN vendas v ON v.id = c.venda_id
      WHERE c.vendedor_id = $1
        AND c.mes_competencia = $2
        AND c.ano_competencia = $3
        AND c.tenant_id = $4
      ORDER BY c.created_at DESC
    `;

    const comissoesResult = await this.db.query(comissoesQuery, [
      data.vendedorId,
      data.mes,
      data.ano,
      data.tenantId,
    ]);

    const comissoes = comissoesResult.rows.map((row) =>
      this.transformComissao(row)
    );

    // Calcular resumo
    const resumo = {
      totalComissoes: comissoes.length,
      totalPendente: comissoes.filter(
        (c) => c.status === ComissaoStatus.PENDENTE
      ).length,
      totalPago: comissoes.filter((c) => c.status === ComissaoStatus.PAGA)
        .length,
      totalCancelado: comissoes.filter(
        (c) => c.status === ComissaoStatus.CANCELADA
      ).length,
      valorTotal: comissoes.reduce((sum, c) => sum + c.valorComissao, 0),
      valorPendente: comissoes
        .filter((c) => c.status === ComissaoStatus.PENDENTE)
        .reduce((sum, c) => sum + c.valorComissao, 0),
      valorPago: comissoes
        .filter((c) => c.status === ComissaoStatus.PAGA)
        .reduce((sum, c) => sum + c.valorComissao, 0),
    };

    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    return {
      vendedor: {
        id: vendedor.id,
        codigoVendedor: vendedor.codigo_vendedor,
        nome: vendedor.name,
      },
      periodo: {
        mes: data.mes,
        ano: data.ano,
        descricao: `${meses[data.mes - 1]}/${data.ano}`,
      },
      resumo,
      comissoes,
    };
  }

  /**
   * Retorna estatísticas gerais de comissões
   */
  async getStats(tenantId: string, vendedorId?: string): Promise<any> {
    let query = `
      SELECT
        COUNT(*) as total_comissoes,
        COUNT(*) FILTER (WHERE status = 'pendente') as comissoes_pendentes,
        COUNT(*) FILTER (WHERE status = 'paga') as comissoes_pagas,
        COUNT(*) FILTER (WHERE status = 'cancelada') as comissoes_canceladas,
        COALESCE(SUM(valor_comissao), 0) as valor_total,
        COALESCE(SUM(valor_comissao) FILTER (WHERE status = 'pendente'), 0) as valor_pendente,
        COALESCE(SUM(valor_comissao) FILTER (WHERE status = 'paga'), 0) as valor_pago
      FROM comissoes
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

  /**
   * Lista vendedores com totais de comissões
   */
  async getRankingVendedores(
    tenantId: string,
    mes?: number,
    ano?: number
  ): Promise<any[]> {
    let query = `
      SELECT
        vend.id,
        vend.codigo_vendedor,
        u.name as vendedor_nome,
        COUNT(c.id) as total_comissoes,
        COALESCE(SUM(c.valor_comissao) FILTER (WHERE c.status = 'paga'), 0) as valor_pago,
        COALESCE(SUM(c.valor_comissao) FILTER (WHERE c.status = 'pendente'), 0) as valor_pendente,
        COALESCE(SUM(c.valor_comissao), 0) as valor_total
      FROM vendedores vend
      LEFT JOIN users u ON u.id = vend.user_id
      LEFT JOIN comissoes c ON c.vendedor_id = vend.id
      WHERE vend.tenant_id = $1 AND vend.ativo = true
    `;

    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (mes) {
      query += ` AND (c.mes_competencia = $${paramIndex++} OR c.mes_competencia IS NULL)`;
      values.push(mes);
    }

    if (ano) {
      query += ` AND (c.ano_competencia = $${paramIndex++} OR c.ano_competencia IS NULL)`;
      values.push(ano);
    }

    query += `
      GROUP BY vend.id, vend.codigo_vendedor, u.name
      ORDER BY valor_total DESC
    `;

    const result = await this.db.query(query, values);
    return result.rows;
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
