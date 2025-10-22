import { useState, useEffect } from 'react';
import { marketingService, Campaign, CampaignStats, SocialPost, BulkMessage } from '@/services/marketingService';
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
  Plus,
  Calendar as CalendarIcon,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as Tabs from '@radix-ui/react-tabs';
import SocialPostForm from '@/components/marketing/social/SocialPostForm';
import SocialPostList from '@/components/marketing/social/SocialPostList';
import SocialPostCalendar from '@/components/marketing/social/SocialPostCalendar';
import AICopyOptimizer from '@/components/marketing/ai-assistant/AICopyOptimizer';
import AIAnalysisHistory from '@/components/marketing/ai-assistant/AIAnalysisHistory';
import BulkMessageForm from '@/components/marketing/bulk-messaging/BulkMessageForm';
import BulkMessageList from '@/components/marketing/bulk-messaging/BulkMessageList';
import LandingPageList from '@/components/marketing/landing-pages/LandingPageList';

type ActiveTab = 'dashboard' | 'campaigns' | 'social' | 'bulk-messaging' | 'landing-pages' | 'ai-assistant';
type SocialView = 'list' | 'calendar';

export default function MarketingPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Social Media States
  const [socialView, setSocialView] = useState<SocialView>('list');
  const [showSocialPostForm, setShowSocialPostForm] = useState(false);
  const [selectedSocialPost, setSelectedSocialPost] = useState<SocialPost | undefined>();
  const [socialRefreshTrigger, setSocialRefreshTrigger] = useState(0);

  // AI Assistant States
  const [aiRefreshTrigger] = useState(0);

  // Bulk Messaging States
  const [showBulkMessageForm, setShowBulkMessageForm] = useState(false);
  const [selectedBulkMessage, setSelectedBulkMessage] = useState<BulkMessage | undefined>();
  const [bulkRefreshTrigger, setBulkRefreshTrigger] = useState(0);

  // Landing Pages States
  const [landingRefreshTrigger] = useState(0);
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

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '0';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return '0%';
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
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Campanhas de Marketing</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Gerencie e acompanhe todas as suas campanhas de marketing
                </p>
              </div>

              {/* Campaigns List */}
              {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {campaign.description || 'Sem descrição'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : campaign.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : campaign.status === 'draft'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {campaign.status === 'active'
                            ? 'Ativa'
                            : campaign.status === 'paused'
                            ? 'Pausada'
                            : campaign.status === 'draft'
                            ? 'Rascunho'
                            : campaign.status === 'completed'
                            ? 'Concluída'
                            : 'Cancelada'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Target size={14} className="text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Tipo:{' '}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {campaign.type === 'email'
                                ? 'Email'
                                : campaign.type === 'social'
                                ? 'Social'
                                : campaign.type === 'whatsapp'
                                ? 'WhatsApp'
                                : 'Mista'}
                            </span>
                          </span>
                        </div>
                        {campaign.budget && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign size={14} className="text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Orçamento:{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(campaign.budget)}
                              </span>
                            </span>
                          </div>
                        )}
                        {campaign.spent !== undefined && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  ((campaign.spent || 0) / (campaign.budget || 1)) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toast.success('Edição de campanhas disponível em breve')}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhuma campanha criada
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Crie sua primeira campanha para começar a gerenciar seu marketing
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                  API de Campanhas Disponível
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  O CRUD completo de campanhas está disponível via API. Interface de edição será implementada em breve.
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>Criar, editar e excluir campanhas</li>
                  <li>Métricas de performance em tempo real</li>
                  <li>Filtros por tipo, status e período</li>
                  <li>Orçamento e controle de gastos</li>
                </ul>
              </div>
            </div>
          </Tabs.Content>

          {/* Social Posts Tab */}
          <Tabs.Content value="social">
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Redes Sociais</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gerencie posts para Instagram, Facebook, LinkedIn e TikTok
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setSocialView('list')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        socialView === 'list'
                          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <List size={18} />
                      Lista
                    </button>
                    <button
                      onClick={() => setSocialView('calendar')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        socialView === 'calendar'
                          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <CalendarIcon size={18} />
                      Calendário
                    </button>
                  </div>

                  {/* New Post Button */}
                  <button
                    onClick={() => {
                      setSelectedSocialPost(undefined);
                      setShowSocialPostForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                    Novo Post
                  </button>
                </div>
              </div>

              {/* Content based on view */}
              {socialView === 'list' ? (
                <SocialPostList
                  onEdit={(post) => {
                    setSelectedSocialPost(post);
                    setShowSocialPostForm(true);
                  }}
                  refreshTrigger={socialRefreshTrigger}
                />
              ) : (
                <SocialPostCalendar
                  onSelectPost={(post) => {
                    setSelectedSocialPost(post);
                    setShowSocialPostForm(true);
                  }}
                  refreshTrigger={socialRefreshTrigger}
                />
              )}

              {/* Social Post Form Modal */}
              <SocialPostForm
                post={selectedSocialPost}
                isOpen={showSocialPostForm}
                onClose={() => {
                  setShowSocialPostForm(false);
                  setSelectedSocialPost(undefined);
                }}
                onSuccess={() => {
                  setSocialRefreshTrigger((prev) => prev + 1);
                }}
              />
            </div>
          </Tabs.Content>

          {/* Bulk Messaging Tab */}
          <Tabs.Content value="bulk-messaging">
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mensagens em Massa</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Envie mensagens para múltiplos leads via WhatsApp, Instagram ou Email
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedBulkMessage(undefined);
                      setShowBulkMessageForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                    Nova Mensagem
                  </button>
                </div>
              </div>

              {/* Bulk Message List */}
              <BulkMessageList
                onEdit={(message) => {
                  setSelectedBulkMessage(message);
                  setShowBulkMessageForm(true);
                }}
                refreshTrigger={bulkRefreshTrigger}
              />

              {/* Bulk Message Form Modal */}
              <BulkMessageForm
                message={selectedBulkMessage}
                isOpen={showBulkMessageForm}
                onClose={() => {
                  setShowBulkMessageForm(false);
                  setSelectedBulkMessage(undefined);
                }}
                onSuccess={() => {
                  setBulkRefreshTrigger((prev) => prev + 1);
                }}
              />
            </div>
          </Tabs.Content>

          {/* Landing Pages Tab */}
          <Tabs.Content value="landing-pages">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Landing Pages</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Gerencie landing pages para captura de leads
                </p>
              </div>

              <LandingPageList
                onEdit={() => {
                  toast.success('Editor visual de Landing Pages será implementado em breve');
                }}
                refreshTrigger={landingRefreshTrigger}
              />

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  Editor Visual (Em Desenvolvimento)
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  O editor visual GrapesJS será integrado em breve para criar landing pages profissionais com arrastar e soltar.
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>API completa já disponível</li>
                  <li>Publicação e analytics funcionais</li>
                  <li>SEO metadata configurável</li>
                  <li>Tracking de conversões</li>
                </ul>
              </div>
            </div>
          </Tabs.Content>

          {/* AI Assistant Tab */}
          <Tabs.Content value="ai-assistant">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-primary-600" />
                  Assistente de IA
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Otimize seus conteúdos com múltiplos provedores de IA
                </p>
              </div>

              {/* AI Copy Optimizer */}
              <AICopyOptimizer />

              {/* AI Analysis History */}
              <AIAnalysisHistory refreshTrigger={aiRefreshTrigger} />
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
