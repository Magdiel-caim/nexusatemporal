import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShoppingCart, DollarSign, BarChart } from 'lucide-react';
import VendedoresTab from './VendedoresTab';
import VendasTab from './VendasTab';
import ComissoesTab from './ComissoesTab';
import DashboardTab from './DashboardTab';

/**
 * Página principal do módulo de Vendas e Comissões
 *
 * Contém 4 tabs:
 * - Dashboard: Métricas gerais e rankings
 * - Vendedores: CRUD de vendedores
 * - Vendas: Lista e gestão de vendas
 * - Comissões: Relatórios e pagamentos
 */
const VendasPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname;
    // Verificar paths exatos primeiro
    if (path === '/vendas' || path === '/vendas/') return 'dashboard';
    if (path === '/vendas/dashboard') return 'dashboard';
    if (path === '/vendas/vendedores') return 'vendedores';
    if (path === '/vendas/vendas') return 'vendas';
    if (path === '/vendas/comissoes') return 'comissoes';
    // Fallback para verificações com includes (para subrotas)
    if (path.includes('/vendedores')) return 'vendedores';
    if (path.includes('/comissoes')) return 'comissoes';
    // Se nada bater, dashboard é o padrão
    return 'dashboard';
  });

  useEffect(() => {
    const path = location.pathname;
    // Verificar paths exatos primeiro
    if (path === '/vendas' || path === '/vendas/' || path === '/vendas/dashboard') {
      setActiveTab('dashboard');
    } else if (path === '/vendas/vendedores' || path.includes('/vendedores')) {
      setActiveTab('vendedores');
    } else if (path === '/vendas/vendas') {
      setActiveTab('vendas');
    } else if (path === '/vendas/comissoes' || path.includes('/comissoes')) {
      setActiveTab('comissoes');
    }
  }, [location]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendas e Comissões</h1>
          <p className="text-muted-foreground">
            Gestão completa de vendas, vendedores e comissionamento
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => navigate(`/vendas/${value === 'dashboard' ? '' : value}`)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="vendedores" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Vendedores
          </TabsTrigger>
          <TabsTrigger value="vendas" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="comissoes" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Comissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="vendedores" className="space-y-4">
          <VendedoresTab />
        </TabsContent>

        <TabsContent value="vendas" className="space-y-4">
          <VendasTab />
        </TabsContent>

        <TabsContent value="comissoes" className="space-y-4">
          <ComissoesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendasPage;
