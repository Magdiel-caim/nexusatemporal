import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listVendas,
  confirmarVenda,
  cancelarVenda,
  type Venda,
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
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const VendasTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vendedorFilter, setVendedorFilter] = useState<string>('all');
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para listar vendas
  const { data: vendas = [], isLoading } = useQuery({
    queryKey: ['vendas', statusFilter, vendedorFilter],
    queryFn: () =>
      listVendas({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        vendedorId: vendedorFilter !== 'all' ? vendedorFilter : undefined,
      }),
  });

  // Query para listar vendedores (para filtro)
  const { data: vendedores = [] } = useQuery({
    queryKey: ['vendedores'],
    queryFn: () => import('@/services/vendasService').then((m) => m.listVendedores()),
  });

  // Mutation para confirmar venda
  const confirmarMutation = useMutation({
    mutationFn: confirmarVenda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      toast({
        title: 'Venda confirmada',
        description: 'Venda confirmada e comissão gerada com sucesso!',
      });
      setIsDetailDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao confirmar venda',
        variant: 'destructive',
      });
    },
  });

  // Mutation para cancelar venda
  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      cancelarVenda(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      toast({
        title: 'Venda cancelada',
        description: 'Venda cancelada com sucesso!',
      });
      setIsCancelDialogOpen(false);
      setIsDetailDialogOpen(false);
      setCancelMotivo('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao cancelar venda',
        variant: 'destructive',
      });
    },
  });

  const handleConfirmar = (venda: Venda) => {
    if (
      window.confirm(
        `Confirmar venda ${venda.numeroVenda}? Isso irá gerar a comissão automaticamente.`
      )
    ) {
      confirmarMutation.mutate(venda.id);
    }
  };

  const handleOpenCancelDialog = (venda: Venda) => {
    setSelectedVenda(venda);
    setIsCancelDialogOpen(true);
  };

  const handleCancelar = () => {
    if (!selectedVenda || !cancelMotivo.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe o motivo do cancelamento',
        variant: 'destructive',
      });
      return;
    }

    cancelarMutation.mutate({
      id: selectedVenda.id,
      motivo: cancelMotivo,
    });
  };

  const handleViewDetails = (venda: Venda) => {
    setSelectedVenda(venda);
    setIsDetailDialogOpen(true);
  };

  // Filtrar vendas
  const filteredVendas = vendas.filter((venda) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      venda.numeroVenda.toLowerCase().includes(searchLower) ||
      venda.vendedor?.nome.toLowerCase().includes(searchLower) ||
      venda.lead?.name.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pendente: 'secondary',
      confirmada: 'default',
      cancelada: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Busca */}
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, vendedor, cliente..."
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
                <SelectItem value="confirmada">Confirmada</SelectItem>
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
          </div>

          {/* Tabela de vendas */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor Bruto</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Valor Líquido</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredVendas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium">
                        {venda.numeroVenda}
                      </TableCell>
                      <TableCell>
                        {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{venda.vendedor?.nome || '-'}</TableCell>
                      <TableCell>{venda.lead?.name || '-'}</TableCell>
                      <TableCell>
                        R$ {venda.valorBruto.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        R$ {venda.desconto.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {venda.valorLiquido.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        R$ {(venda.valorComissao || 0).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>{getStatusBadge(venda.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(venda)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {venda.status === 'pendente' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleConfirmar(venda)}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenCancelDialog(venda)}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalhes da venda */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
            <DialogDescription>
              Informações completas sobre a venda
            </DialogDescription>
          </DialogHeader>

          {selectedVenda && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Número</Label>
                  <p className="font-medium">{selectedVenda.numeroVenda}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedVenda.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data da Venda</Label>
                  <p>
                    {new Date(selectedVenda.dataVenda).toLocaleString('pt-BR')}
                  </p>
                </div>
                {selectedVenda.dataConfirmacao && (
                  <div>
                    <Label className="text-muted-foreground">
                      Data de Confirmação
                    </Label>
                    <p>
                      {new Date(selectedVenda.dataConfirmacao).toLocaleString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Vendedor</Label>
                  <p>{selectedVenda.vendedor?.nome || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <p>{selectedVenda.lead?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Procedimento</Label>
                  <p>{selectedVenda.procedure?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Forma de Pagamento
                  </Label>
                  <p>{selectedVenda.formaPagamento || '-'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Valores</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Valor Bruto</Label>
                    <p className="text-lg">
                      R$ {selectedVenda.valorBruto.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Desconto</Label>
                    <p className="text-lg">
                      R$ {selectedVenda.desconto.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Valor Líquido
                    </Label>
                    <p className="text-lg font-semibold">
                      R$ {selectedVenda.valorLiquido.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Comissão ({selectedVenda.percentualComissao}%)
                    </Label>
                    <p className="text-lg font-semibold text-green-600">
                      R${' '}
                      {(selectedVenda.valorComissao || 0).toLocaleString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {selectedVenda.observacoes && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="mt-1">{selectedVenda.observacoes}</p>
                </div>
              )}

              {selectedVenda.status === 'cancelada' &&
                selectedVenda.motivoCancelamento && (
                  <div className="border-t pt-4">
                    <Label className="text-muted-foreground">
                      Motivo do Cancelamento
                    </Label>
                    <p className="mt-1 text-red-600">
                      {selectedVenda.motivoCancelamento}
                    </p>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
            {selectedVenda?.status === 'pendente' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    handleOpenCancelDialog(selectedVenda);
                  }}
                >
                  Cancelar Venda
                </Button>
                <Button onClick={() => handleConfirmar(selectedVenda)}>
                  Confirmar Venda
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de cancelamento */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Venda</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento da venda{' '}
              {selectedVenda?.numeroVenda}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo do Cancelamento *</Label>
              <Textarea
                id="motivo"
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
                placeholder="Descreva o motivo do cancelamento..."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelMotivo('');
              }}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelar}
              disabled={cancelarMutation.isPending || !cancelMotivo.trim()}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendasTab;
