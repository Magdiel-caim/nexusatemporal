import { useState, useEffect } from 'react';
import { marketingService, Campaign, CampaignStats } from '@/services/marketingService';
import {
  Target,
  DollarSign,
  MousePointer,
  Eye,
  Share2,
  Mail,
  Megaphone,
  FileText,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as Tabs from '@radix-ui/react-tabs';

type ActiveTab = 'dashboard' | 'campaigns' | 'social' | 'bulk-messaging' | 'landing-pages' | 'ai-assistant';

export default function MarketingPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: 0,
    totalBudget: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    avgCtr: 0,
    avgConversionRate: 0,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    try {
      setLoading(true);

      const [campaignStats, allCampaigns] = await Promise.all([
        marketingService.getCampaignStats(),
        marketingService.getCampaigns(),
      ]);

      setStats(campaignStats);
      setCampaigns(allCampaigns);
    } catch (error) {
      console.error('Erro ao carregar dados de marketing:', error);
      toast.error('Erro ao carregar dados de marketing');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Marketing</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas campanhas, redes sociais e análises de marketing
          </p>
        </div>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)}>
          <Tabs.List className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
            <Tabs.Trigger
              value="dashboard"
              className="px-4 py-3 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={16} />
                Dashboard
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="campaigns"
              className="px-4 py-3 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Target size={16} />
                Campanhas
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="social"
              className="px-4 py-3 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Share2 size={16} />
                Redes Sociais
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="bulk-messaging"
              className="px-4 py-3 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Mail size={16} />
                Mensagens em Massa
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="landing-pages"
              className="px-4 py-3 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Landing Pages
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="ai-assistant"
              className="px-4 py-3 text-sm font-medium transition-colors data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                Assistente IA
              </div>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Dashboard Tab */}
          <Tabs.Content value="dashboard">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Total Campaigns */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Campanhas Ativas
                  </span>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeCampaigns}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  de {stats.totalCampaigns} totais
                </p>
              </div>

              {/* Total Impressions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Impressões
                  </span>
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.totalImpressions)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  CTR: {formatPercentage(stats.avgCtr)}
                </p>
              </div>

              {/* Total Clicks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cliques
                  </span>
                  <MousePointer className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.totalClicks)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.totalConversions} conversões
                </p>
              </div>

              {/* Budget */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Investimento
                  </span>
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalSpent)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  de {formatCurrency(stats.totalBudget)}
                </p>
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Campanhas Recentes
                </h2>
              </div>
              <div className="p-6">
                {campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {campaign.description || 'Sem descrição'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {campaign.type === 'email' && 'Email'}
                              {campaign.type === 'social' && 'Social'}
                              {campaign.type === 'whatsapp' && 'WhatsApp'}
                              {campaign.type === 'mixed' && 'Mista'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {campaign.status === 'draft' && 'Rascunho'}
                              {campaign.status === 'active' && 'Ativa'}
                              {campaign.status === 'paused' && 'Pausada'}
                              {campaign.status === 'completed' && 'Concluída'}
                              {campaign.status === 'cancelled' && 'Cancelada'}
                            </p>
                          </div>
                          {campaign.budget && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(campaign.spent || 0)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                de {formatCurrency(campaign.budget)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma campanha criada
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Crie sua primeira campanha para começar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>

          {/* Campaigns Tab */}
          <Tabs.Content value="campaigns">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Gerenciamento de Campanhas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Interface completa em desenvolvimento
                </p>
                <div className="text-left max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Funcionalidades disponíveis via API:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>POST/GET/PUT/DELETE /api/marketing/campaigns</li>
                    <li>GET /api/marketing/campaigns/stats</li>
                    <li>Filtros por tipo, status e período</li>
                    <li>Métricas de performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Social Posts Tab */}
          <Tabs.Content value="social">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <Share2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Gerenciamento de Redes Sociais
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Interface completa em desenvolvimento
                </p>
                <div className="text-left max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Funcionalidades disponíveis via API:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>POST/GET/PUT/DELETE /api/marketing/social-posts</li>
                    <li>POST /api/marketing/social-posts/:id/schedule</li>
                    <li>Suporte: Instagram, Facebook, LinkedIn, TikTok</li>
                    <li>Tipos: Feed, Story, Reel, Carousel</li>
                    <li>Agendamento e métricas</li>
                  </ul>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Bulk Messaging Tab */}
          <Tabs.Content value="bulk-messaging">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Mensagens em Massa
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Interface completa em desenvolvimento
                </p>
                <div className="text-left max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Funcionalidades disponíveis via API:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>POST/GET /api/marketing/bulk-messages</li>
                    <li>Plataformas: WhatsApp, Instagram DM, Email</li>
                    <li>Controle de destinatários e status</li>
                    <li>Métricas de entrega e abertura</li>
                  </ul>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Landing Pages Tab */}
          <Tabs.Content value="landing-pages">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Landing Pages
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Interface completa em desenvolvimento
                </p>
                <div className="text-left max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Funcionalidades disponíveis via API:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>POST/GET/PUT /api/marketing/landing-pages</li>
                    <li>POST /api/marketing/landing-pages/:id/publish</li>
                    <li>GET /api/marketing/landing-pages/:id/analytics</li>
                    <li>Editor GrapesJS integrado</li>
                    <li>SEO e analytics completos</li>
                  </ul>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* AI Assistant Tab */}
          <Tabs.Content value="ai-assistant">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Assistente de IA
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Interface completa em desenvolvimento
                </p>
                <div className="text-left max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Funcionalidades disponíveis via API:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>POST /api/marketing/ai/analyze</li>
                    <li>POST /api/marketing/ai/optimize-copy</li>
                    <li>POST /api/marketing/ai/generate-image</li>
                    <li>Providers: Groq, OpenRouter, DeepSeek, Mistral, Qwen, Ollama</li>
                    <li>Análises: Sentimento, Otimização, Predição, Copywriting</li>
                  </ul>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
