import api from './api';

// ============================================
// TYPES
// ============================================

export interface Vendedor {
  id: string;
  codigoVendedor: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  percentualComissaoPadrao: number;
  tipoComissao: 'percentual' | 'fixo' | 'misto';
  valorFixoComissao?: number;
  metaMensal?: number;
  ativo: boolean;
  dataInicio: string;
  dataFim?: string;
  observacoes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Venda {
  id: string;
  numeroVenda: string;
  vendedorId: string;
  vendedor?: {
    codigoVendedor: string;
    nome: string;
  };
  leadId?: string;
  lead?: {
    name: string;
    email?: string;
  };
  appointmentId?: string;
  procedureId?: string;
  procedure?: {
    name: string;
  };
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
  percentualComissao?: number;
  valorComissao?: number;
  dataVenda: string;
  dataConfirmacao?: string;
  dataCancelamento?: string;
  status: 'pendente' | 'confirmada' | 'cancelada';
  motivoCancelamento?: string;
  transactionId?: string;
  formaPagamento?: string;
  observacoes?: string;
  metadata?: Record<string, any>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comissao {
  id: string;
  vendaId: string;
  venda?: {
    numeroVenda: string;
    valorLiquido: number;
  };
  vendedorId: string;
  vendedor?: {
    codigoVendedor: string;
    nome: string;
  };
  valorBaseCalculo: number;
  percentualAplicado: number;
  valorComissao: number;
  mesCompetencia: number;
  anoCompetencia: number;
  periodoCompetencia?: string;
  status: 'pendente' | 'paga' | 'cancelada';
  dataPagamento?: string;
  transactionId?: string;
  observacoes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendasStats {
  total_vendas: string;
  vendas_confirmadas: string;
  vendas_pendentes: string;
  vendas_canceladas: string;
  valor_total: string;
  ticket_medio: string;
}

export interface ComissoesStats {
  total_comissoes: string;
  comissoes_pendentes: string;
  comissoes_pagas: string;
  comissoes_canceladas: string;
  valor_total: string;
  valor_pendente: string;
  valor_pago: string;
}

export interface RelatorioMensal {
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

export interface RankingVendedor {
  id: string;
  codigo_vendedor: string;
  vendedor_nome: string;
  total_comissoes: string;
  valor_pago: string;
  valor_pendente: string;
  valor_total: string;
}

// ============================================
// VENDEDORES
// ============================================

export const createVendedor = async (data: Partial<Vendedor>): Promise<Vendedor> => {
  const response = await api.post('/vendas/vendedores', data);
  return response.data;
};

export const listVendedores = async (): Promise<Vendedor[]> => {
  const response = await api.get('/vendas/vendedores');
  return response.data;
};

export const getVendedor = async (id: string): Promise<Vendedor> => {
  const response = await api.get(`/vendas/vendedores/${id}`);
  return response.data;
};

export const updateVendedor = async (id: string, data: Partial<Vendedor>): Promise<Vendedor> => {
  const response = await api.put(`/vendas/vendedores/${id}`, data);
  return response.data;
};

export const deleteVendedor = async (id: string): Promise<void> => {
  await api.delete(`/vendas/vendedores/${id}`);
};

export const getVendasByVendedor = async (
  vendedorId: string,
  filters?: {
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }
): Promise<Venda[]> => {
  const response = await api.get(`/vendas/vendedores/${vendedorId}/vendas`, {
    params: filters,
  });
  return response.data;
};

// ============================================
// VENDAS
// ============================================

export const createVenda = async (data: Partial<Venda>): Promise<Venda> => {
  const response = await api.post('/vendas', data);
  return response.data;
};

export const listVendas = async (filters?: {
  vendedorId?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}): Promise<Venda[]> => {
  const response = await api.get('/vendas', { params: filters });
  return response.data;
};

export const getVenda = async (id: string): Promise<Venda> => {
  const response = await api.get(`/vendas/${id}`);
  return response.data;
};

export const confirmarVenda = async (id: string): Promise<Venda> => {
  const response = await api.post(`/vendas/${id}/confirmar`);
  return response.data;
};

export const cancelarVenda = async (id: string, motivo: string): Promise<Venda> => {
  const response = await api.post(`/vendas/${id}/cancelar`, { motivo });
  return response.data;
};

export const getVendasStats = async (vendedorId?: string): Promise<VendasStats> => {
  const response = await api.get('/vendas/stats', {
    params: vendedorId ? { vendedorId } : {},
  });
  return response.data;
};

// ============================================
// COMISSÕES
// ============================================

export const listComissoes = async (filters?: {
  vendedorId?: string;
  status?: string;
  mes?: number;
  ano?: number;
}): Promise<Comissao[]> => {
  const response = await api.get('/vendas/comissoes', { params: filters });
  return response.data;
};

export const getComissao = async (id: string): Promise<Comissao> => {
  const response = await api.get(`/vendas/comissoes/${id}`);
  return response.data;
};

export const pagarComissao = async (
  id: string,
  transactionId?: string
): Promise<Comissao> => {
  const response = await api.post(`/vendas/comissoes/${id}/pagar`, {
    transactionId,
  });
  return response.data;
};

export const getRelatorioComissoes = async (
  vendedorId: string,
  mes: number,
  ano: number
): Promise<RelatorioMensal> => {
  const response = await api.get('/vendas/comissoes/relatorio', {
    params: { vendedorId, mes, ano },
  });
  return response.data;
};

export const getComissoesStats = async (vendedorId?: string): Promise<ComissoesStats> => {
  const response = await api.get('/vendas/comissoes/stats', {
    params: vendedorId ? { vendedorId } : {},
  });
  return response.data;
};

// ============================================
// RANKINGS
// ============================================

export const getRankingVendedores = async (
  mes?: number,
  ano?: number
): Promise<RankingVendedor[]> => {
  const response = await api.get('/vendas/ranking', {
    params: { mes, ano },
  });
  return response.data;
};
