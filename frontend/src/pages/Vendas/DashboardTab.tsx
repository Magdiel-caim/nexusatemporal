import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getVendasStats,
  getComissoesStats,
  getRankingVendedores,
  type VendasStats,
  type ComissoesStats,
  type RankingVendedor,
} from '@/services/vendasService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Award,
} from 'lucide-react';

const DashboardTab: React.FC = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [rankingMes, setRankingMes] = useState<number | undefined>(currentMonth);
  const [rankingAno, setRankingAno] = useState<number | undefined>(currentYear);

  // Query para estatísticas de vendas
  const { data: vendasStats } = useQuery<VendasStats>({
    queryKey: ['vendas-stats'],
    queryFn: () => getVendasStats(),
  });

  // Query para estatísticas de comissões
  const { data: comissoesStats } = useQuery<ComissoesStats>({
    queryKey: ['comissoes-stats'],
    queryFn: () => getComissoesStats(),
  });

  // Query para ranking de vendedores
  const { data: ranking = [], isLoading: isLoadingRanking } = useQuery<
    RankingVendedor[]
  >({
    queryKey: ['ranking', rankingMes, rankingAno],
    queryFn: () => getRankingVendedores(rankingMes, rankingAno),
  });

  const meses = [
    { value: undefined, label: 'Todos os períodos' },
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const anos = [
    { value: undefined, label: 'Todos os anos' },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: currentYear - i,
      label: (currentYear - i).toString(),
    })),
  ];

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const getMedalIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Award className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas de Vendas */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estatísticas de Vendas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vendasStats?.total_vendas || '0'}
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>{vendasStats?.vendas_confirmadas || '0'} confirmadas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-600" />
                  <span>{vendasStats?.vendas_pendentes || '0'} pendentes</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-600" />
                  <span>{vendasStats?.vendas_canceladas || '0'} canceladas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(vendasStats?.valor_total || '0')}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Todas as vendas confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(vendasStats?.ticket_medio || '0')}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Valor médio por venda
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas de Comissões */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estatísticas de Comissões</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Comissões
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {comissoesStats?.total_comissoes || '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Todas as comissões geradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(comissoesStats?.valor_total || '0')}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total em comissões
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comissões Pagas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(comissoesStats?.valor_pago || '0')}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {comissoesStats?.comissoes_pagas || '0'} comissões pagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comissões Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(comissoesStats?.valor_pendente || '0')}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {comissoesStats?.comissoes_pendentes || '0'} comissões pendentes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ranking de Vendedores */}
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ranking de Vendedores</CardTitle>
              <div className="flex gap-2">
                <Select
                  value={rankingMes?.toString() || 'all'}
                  onValueChange={(value) =>
                    setRankingMes(value === 'all' ? undefined : parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem
                        key={mes.value || 'all'}
                        value={mes.value?.toString() || 'all'}
                      >
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={rankingAno?.toString() || 'all'}
                  onValueChange={(value) =>
                    setRankingAno(value === 'all' ? undefined : parseInt(value))
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map((ano) => (
                      <SelectItem
                        key={ano.value || 'all'}
                        value={ano.value?.toString() || 'all'}
                      >
                        {ano.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Posição</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Qtd Comissões</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Valor Pendente</TableHead>
                    <TableHead>Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingRanking ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Carregando ranking...
                      </TableCell>
                    </TableRow>
                  ) : ranking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Nenhum vendedor no ranking para o período selecionado
                      </TableCell>
                    </TableRow>
                  ) : (
                    ranking.map((vendedor, index) => {
                      const posicao = index + 1;
                      return (
                        <TableRow
                          key={vendedor.id}
                          className={
                            posicao <= 3 ? 'bg-muted/50' : undefined
                          }
                        >
                          <TableCell className="font-bold">
                            <div className="flex items-center gap-2">
                              {getMedalIcon(posicao)}
                              <span>{posicao}º</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {vendedor.codigo_vendedor}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {vendedor.vendedor_nome}
                          </TableCell>
                          <TableCell>{vendedor.total_comissoes}</TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(vendedor.valor_pago)}
                          </TableCell>
                          <TableCell className="text-orange-600">
                            {formatCurrency(vendedor.valor_pendente)}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(vendedor.valor_total)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;
