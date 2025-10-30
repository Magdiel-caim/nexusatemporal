/**
 * Configurações Page
 *
 * Página principal de configurações do sistema
 */

import React, { useState } from 'react';
import { Settings, CreditCard, Bell, Users, Database, Shield, Palette, Bot, Key } from 'lucide-react';
import UsersManagement from '@/components/users/UsersManagement';
import AIIntegrationsTab from '@/components/settings/AIIntegrationsTab';
import ApiKeysManagement from '@/components/settings/ApiKeysManagement';

interface ConfigSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ConfiguracoesPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('integracoes');

  const sections: ConfigSection[] = [
    {
      id: 'integracoes',
      label: 'Integrações',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Gateways de pagamento, APIs e serviços externos',
    },
    {
      id: 'api-keys',
      label: 'API Keys',
      icon: <Key className="w-5 h-5" />,
      description: 'Gerencie chaves de API para N8N e integrações externas',
    },
    {
      id: 'ai-integrations',
      label: 'Integrações de IA',
      icon: <Bot className="w-5 h-5" />,
      description: 'OpenAI, Claude, Gemini, OpenRouter e outras IAs',
    },
    {
      id: 'notificacoes',
      label: 'Notificações',
      icon: <Bell className="w-5 h-5" />,
      description: 'Configure alertas e notificações do sistema',
    },
    {
      id: 'usuarios',
      label: 'Usuários e Permissões',
      icon: <Users className="w-5 h-5" />,
      description: 'Gerencie usuários, funções e permissões',
    },
    {
      id: 'sistema',
      label: 'Sistema',
      icon: <Database className="w-5 h-5" />,
      description: 'Configurações gerais do sistema',
    },
    {
      id: 'seguranca',
      label: 'Segurança',
      icon: <Shield className="w-5 h-5" />,
      description: 'Políticas de segurança e autenticação',
    },
    {
      id: 'aparencia',
      label: 'Aparência',
      icon: <Palette className="w-5 h-5" />,
      description: 'Personalize a aparência do sistema',
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'integracoes':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Integrações</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Configure integrações com serviços externos e gateways de pagamento
            </p>

            <div className="space-y-6">
              {/* Payment Gateway Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      Gateways de Pagamento
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Configure Asaas e PagBank para receber pagamentos via Boleto, PIX e Cartão
                    </p>
                  </div>
                  <a
                    href="/configuracoes/integracoes/pagamentos"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Configurar
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Asaas</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Boleto, PIX, Cartão de Crédito, Assinaturas
                    </p>
                    <div className="mt-3 flex items-center">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        Não configurado
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">PagBank</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Boleto, PIX, Cartão, Parcelamento
                    </p>
                    <div className="mt-3 flex items-center">
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        Em breve
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Integração com WhatsApp Business para atendimento
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium">
                    Ativo
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Conexão estabelecida via WAHA API</p>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Próximas Integrações
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <div className="text-2xl mb-2">📧</div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Email Marketing</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SendGrid, Mailchimp</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Analytics</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Google Analytics, Meta Pixel</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">SMS</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Twilio, Zenvia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api-keys':
        return <ApiKeysManagement />;

      case 'ai-integrations':
        return <AIIntegrationsTab />;

      case 'notificacoes':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notificações</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Configure como e quando você deseja receber notificações
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Em desenvolvimento...</p>
            </div>
          </div>
        );

      case 'usuarios':
        return <UsersManagement />;

      case 'sistema':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configurações do Sistema</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Configurações gerais e preferências do sistema
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Em desenvolvimento...</p>
            </div>
          </div>
        );

      case 'seguranca':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Segurança</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Políticas de segurança, autenticação e logs de acesso
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Em desenvolvimento...</p>
            </div>
          </div>
        );

      case 'aparencia':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aparência</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Personalize cores, logo e tema do sistema
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Em desenvolvimento...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Settings className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie todas as configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-start px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-l-4 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="mr-3 mt-0.5">{section.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {section.description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
