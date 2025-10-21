import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listVendedores,
  createVendedor,
  updateVendedor,
  deleteVendedor,
  type Vendedor,
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
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface VendedorFormData {
  userId: string;
  percentualComissaoPadrao: number;
  tipoComissao: 'percentual' | 'fixo' | 'misto';
  valorFixoComissao?: number;
  metaMensal?: number;
  dataInicio: string;
  observacoes?: string;
}

const VendedoresTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [formData, setFormData] = useState<VendedorFormData>({
    userId: '',
    percentualComissaoPadrao: 10,
    tipoComissao: 'percentual',
    dataInicio: new Date().toISOString().split('T')[0],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para listar vendedores
  const { data: vendedores = [], isLoading, isError } = useQuery({
    queryKey: ['vendedores'],
    queryFn: listVendedores,
  });

  // Mutation para criar vendedor
  const createMutation = useMutation({
    mutationFn: createVendedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      toast({
        title: 'Vendedor criado',
        description: 'Vendedor cadastrado com sucesso!',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao criar vendedor',
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar vendedor
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendedor> }) =>
      updateVendedor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      toast({
        title: 'Vendedor atualizado',
        description: 'Dados do vendedor atualizados com sucesso!',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao atualizar vendedor',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar vendedor
  const deleteMutation = useMutation({
    mutationFn: deleteVendedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores'] });
      toast({
        title: 'Vendedor desativado',
        description: 'Vendedor desativado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao desativar vendedor',
        variant: 'destructive',
      });
    },
  });

  const handleOpenDialog = (vendedor?: Vendedor) => {
    if (vendedor) {
      setEditingVendedor(vendedor);
      setFormData({
        userId: vendedor.userId,
        percentualComissaoPadrao: vendedor.percentualComissaoPadrao,
        tipoComissao: vendedor.tipoComissao,
        valorFixoComissao: vendedor.valorFixoComissao,
        metaMensal: vendedor.metaMensal,
        dataInicio: vendedor.dataInicio.split('T')[0],
        observacoes: vendedor.observacoes,
      });
    } else {
      setEditingVendedor(null);
      setFormData({
        userId: '',
        percentualComissaoPadrao: 10,
        tipoComissao: 'percentual',
        dataInicio: new Date().toISOString().split('T')[0],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVendedor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVendedor) {
      updateMutation.mutate({
        id: editingVendedor.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este vendedor?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filtrar vendedores
  const filteredVendedores = vendedores.filter((vendedor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vendedor.codigoVendedor.toLowerCase().includes(searchLower) ||
      vendedor.user?.name?.toLowerCase().includes(searchLower) ||
      vendedor.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  // Tratamento de erro
  if (isError) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold">
            ⚠️ Erro ao carregar dados
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Não foi possível carregar as informações. Tente novamente mais tarde.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com busca e botão de criar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vendedores Cadastrados</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Vendedor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Tabela de vendedores */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo Comissão</TableHead>
                  <TableHead>% Padrão</TableHead>
                  <TableHead>Meta Mensal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredVendedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Nenhum vendedor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendedores.map((vendedor) => (
                    <TableRow key={vendedor.id}>
                      <TableCell className="font-medium">
                        {vendedor.codigoVendedor}
                      </TableCell>
                      <TableCell>{vendedor.user?.name || '-'}</TableCell>
                      <TableCell>{vendedor.user?.email || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {vendedor.tipoComissao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vendedor.percentualComissaoPadrao}%
                      </TableCell>
                      <TableCell>
                        {vendedor.metaMensal
                          ? `R$ ${vendedor.metaMensal.toLocaleString('pt-BR')}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={vendedor.ativo ? 'default' : 'secondary'}>
                          {vendedor.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(vendedor)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(vendedor.id)}
                          disabled={!vendedor.ativo}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Dialog de criar/editar vendedor */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do vendedor e configure o comissionamento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">ID do Usuário *</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  required
                  placeholder="UUID do usuário"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoComissao">Tipo de Comissão *</Label>
                <Select
                  value={formData.tipoComissao}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, tipoComissao: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual</SelectItem>
                    <SelectItem value="fixo">Fixo</SelectItem>
                    <SelectItem value="misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentualComissaoPadrao">
                  % Comissão Padrão *
                </Label>
                <Input
                  id="percentualComissaoPadrao"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.percentualComissaoPadrao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      percentualComissaoPadrao: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              {(formData.tipoComissao === 'fixo' ||
                formData.tipoComissao === 'misto') && (
                <div className="space-y-2">
                  <Label htmlFor="valorFixoComissao">Valor Fixo</Label>
                  <Input
                    id="valorFixoComissao"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorFixoComissao || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        valorFixoComissao: parseFloat(e.target.value),
                      })
                    }
                    placeholder="R$ 0,00"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="metaMensal">Meta Mensal</Label>
                <Input
                  id="metaMensal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.metaMensal || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaMensal: parseFloat(e.target.value),
                    })
                  }
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                placeholder="Informações adicionais sobre o vendedor..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingVendedor ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendedoresTab;
