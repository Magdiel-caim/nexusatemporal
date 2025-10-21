import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listComissoes,
  pagarComissao,
  getRelatorioComissoes,
  type Comissao,
  type RelatorioMensal,
} from '@/services/vendasService';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, DollarSign, FileText, Check } from 'lucide-react';

const ComissoesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vendedorFilter, setVendedorFilter] = useState<string>('all');
  const [mesFilter, setMesFilter] = useState<number | undefined>(undefined);
  const [anoFilter, setAnoFilter] = useState<number>(new Date().getFullYear());
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedComissao, setSelectedComissao] = useState<Comissao | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [isRelatorioDialogOpen, setIsRelatorioDialogOpen] = useState(false);
  const [relatorioVendedorId, setRelatorioVendedorId] = useState('');
  const [relatorioMes, setRelatorioMes] = useState(new Date().getMonth() + 1);
  const [relatorioAno, setRelatorioAno] = useState(new Date().getFullYear());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para listar comissões
  const { data: comissoes = [], isLoading } = useQuery({
    queryKey: ['comissoes', statusFilter, vendedorFilter, mesFilter, anoFilter],
    queryFn: () =>
      listComissoes({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        vendedorId: vendedorFilter !== 'all' ? vendedorFilter : undefined,
        mes: mesFilter,
        ano: anoFilter,
      }),
  });

  // Query para listar vendedores (para filtro)
  const { data: vendedores = [] } = useQuery({
    queryKey: ['vendedores'],
    queryFn: () => import('@/services/vendasService').then((m) => m.listVendedores()),
  });

  // Query para relatório mensal
  const { data: relatorio, isLoading: isLoadingRelatorio } = useQuery<RelatorioMensal>({
    queryKey: ['relatorio-comissoes', relatorioVendedorId, relatorioMes, relatorioAno],
    queryFn: () =>
      getRelatorioComissoes(relatorioVendedorId, relatorioMes, relatorioAno),
    enabled:
      isRelatorioDialogOpen &&
      !!relatorioVendedorId &&
      !!relatorioMes &&
      !!relatorioAno,
  });

  // Mutation para pagar comissão
  const pagarMutation = useMutation({
    mutationFn: ({ id, transactionId }: { id: string; transactionId?: string }) =>
      pagarComissao(id, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comissoes'] });
      toast({
        title: 'Comissão paga',
        description: 'Comissão marcada como paga com sucesso!',
      });
      setIsPaymentDialogOpen(false);
      setTransactionId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao pagar comissão',
        variant: 'destructive',
      });
    },
  });

  const handleOpenPaymentDialog = (comissao: Comissao) => {
    setSelectedComissao(comissao);
    setIsPaymentDialogOpen(true);
  };

  const handlePagar = () => {
    if (!selectedComissao) return;

    pagarMutation.mutate({
      id: selectedComissao.id,
      transactionId: transactionId || undefined,
    });
  };

  const handleOpenRelatorio = () => {
    setIsRelatorioDialogOpen(true);
  };

  const handleGerarRelatorio = () => {
    if (!relatorioVendedorId) {
      toast({
        title: 'Erro',
        description: 'Selecione um vendedor',
        variant: 'destructive',
      });
      return;
    }

    // A query será executada automaticamente quando os parâmetros mudarem
    queryClient.invalidateQueries({
      queryKey: ['relatorio-comissoes', relatorioVendedorId, relatorioMes, relatorioAno],
    });
  };

  // Filtrar comissões
  const filteredComissoes = comissoes.filter((comissao) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      comissao.vendedor?.nome.toLowerCase().includes(searchLower) ||
      comissao.venda?.numeroVenda.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'secondary',
      paga: 'default',
      cancelada: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const meses = [
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

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comissões</CardTitle>
            <Button onClick={handleOpenRelatorio}>
              <FileText className="w-4 h-4 mr-2" />
              Relatório Mensal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Busca */}
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro de status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="paga">Paga</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de vendedor */}
            <Select value={vendedorFilter} onValueChange={setVendedorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vendedores</SelectItem>
                {vendedores.map((vendedor) => (
                  <SelectItem key={vendedor.id} value={vendedor.id}>
                    {vendedor.user?.name || vendedor.codigoVendedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de mês */}
            <Select
              value={mesFilter?.toString() || 'all'}
              onValueChange={(value) =>
                setMesFilter(value === 'all' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value.toString()}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de ano */}
            <Select
              value={anoFilter.toString()}
              onValueChange={(value) => setAnoFilter(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de comissões */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Venda</TableHead>
                  <TableHead>Valor Base</TableHead>
                  <TableHead>% Aplicado</TableHead>
                  <TableHead>Valor Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredComissoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Nenhuma comissão encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComissoes.map((comissao) => (
                    <TableRow key={comissao.id}>
                      <TableCell className="font-medium">
                        {comissao.periodoCompetencia ||
                          `${comissao.mesCompetencia}/${comissao.anoCompetencia}`}
                      </TableCell>
                      <TableCell>{comissao.vendedor?.nome || '-'}</TableCell>
                      <TableCell>{comissao.venda?.numeroVenda || '-'}</TableCell>
                      <TableCell>
                        R$ {comissao.valorBaseCalculo.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>{comissao.percentualAplicado}%</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        R$ {comissao.valorComissao.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>{getStatusBadge(comissao.status)}</TableCell>
                      <TableCell>
                        {comissao.dataPagamento
                          ? new Date(comissao.dataPagamento).toLocaleDateString(
                              'pt-BR'
                            )
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {comissao.status === 'pendente' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenPaymentDialog(comissao)}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Comissão como Paga</DialogTitle>
            <DialogDescription>
              Registre o pagamento da comissão
            </DialogDescription>
          </DialogHeader>

          {selectedComissao && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor:</span>
                  <span className="font-medium">
                    {selectedComissao.vendedor?.nome}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Período:</span>
                  <span className="font-medium">
                    {selectedComissao.periodoCompetencia}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-semibold text-lg text-green-600">
                    R${' '}
                    {selectedComissao.valorComissao.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId">
                  ID da Transação Financeira (opcional)
                </Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="UUID da transação no módulo financeiro"
                />
                <p className="text-sm text-muted-foreground">
                  Vincule esta comissão a uma transação do módulo financeiro
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPaymentDialogOpen(false);
                setTransactionId('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handlePagar} disabled={pagarMutation.isPending}>
              <DollarSign className="w-4 h-4 mr-2" />
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de relatório mensal */}
      <Dialog open={isRelatorioDialogOpen} onOpenChange={setIsRelatorioDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório Mensal de Comissões</DialogTitle>
            <DialogDescription>
              Visualize o relatório detalhado de comissões por vendedor e período
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filtros do relatório */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vendedor *</Label>
                <Select
                  value={relatorioVendedorId}
                  onValueChange={setRelatorioVendedorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedores.map((vendedor) => (
                      <SelectItem key={vendedor.id} value={vendedor.id}>
                        {vendedor.user?.name || vendedor.codigoVendedor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mês *</Label>
                <Select
                  value={relatorioMes.toString()}
                  onValueChange={(value) => setRelatorioMes(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value.toString()}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ano *</Label>
                <Select
                  value={relatorioAno.toString()}
                  onValueChange={(value) => setRelatorioAno(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map((ano) => (
                      <SelectItem key={ano} value={ano.toString()}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGerarRelatorio} className="w-full">
              Gerar Relatório
            </Button>

            {/* Exibição do relatório */}
            {isLoadingRelatorio ? (
              <div className="text-center py-8">Carregando relatório...</div>
            ) : relatorio ? (
              <div className="space-y-4 border-t pt-4">
                {/* Cabeçalho do relatório */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {relatorio.vendedor.nome}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Código: {relatorio.vendedor.codigoVendedor} | Período:{' '}
                    {relatorio.periodo.descricao}
                  </p>
                </div>

                {/* Resumo */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total de Comissões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {relatorio.resumo.totalComissoes}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Valor Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        R$ {relatorio.resumo.valorTotal.toLocaleString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Valor Pendente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-orange-600">
                        R${' '}
                        {relatorio.resumo.valorPendente.toLocaleString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabela de comissões do relatório */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Venda</TableHead>
                        <TableHead>Valor Base</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorio.comissoes.map((comissao) => (
                        <TableRow key={comissao.id}>
                          <TableCell>{comissao.venda?.numeroVenda}</TableCell>
                          <TableCell>
                            R${' '}
                            {comissao.valorBaseCalculo.toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>{comissao.percentualAplicado}%</TableCell>
                          <TableCell className="font-semibold">
                            R$ {comissao.valorComissao.toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>{getStatusBadge(comissao.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRelatorioDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComissoesTab;
