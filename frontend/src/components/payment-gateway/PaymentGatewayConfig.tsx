/**
 * Payment Gateway Configuration Component
 *
 * Manages payment gateway configurations (Asaas, PagBank)
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Settings, CreditCard, DollarSign, Loader } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface PaymentConfig {
  id?: string;
  gateway: 'asaas' | 'pagbank';
  environment: 'production' | 'sandbox';
  apiKey: string;
  apiSecret?: string;
  webhookSecret?: string;
  isActive: boolean;
  config: {
    enableBoleto?: boolean;
    enablePix?: boolean;
    enableCreditCard?: boolean;
    enableDebit?: boolean;
    defaultDueDays?: number;
    defaultFine?: number;
    defaultInterest?: number;
  };
}

const PaymentGatewayConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'asaas' | 'pagbank'>('asaas');
  const [asaasConfig, setAsaasConfig] = useState<PaymentConfig>({
    gateway: 'asaas',
    environment: 'sandbox',
    apiKey: '',
    webhookSecret: '',
    isActive: false,
    config: {
      enableBoleto: true,
      enablePix: true,
      enableCreditCard: false,
      enableDebit: false,
      defaultDueDays: 7,
      defaultFine: 2,
      defaultInterest: 1,
    },
  });

  const [pagbankConfig, setPagbankConfig] = useState<PaymentConfig>({
    gateway: 'pagbank',
    environment: 'sandbox',
    apiKey: '',
    webhookSecret: '',
    isActive: false,
    config: {
      enableBoleto: true,
      enablePix: true,
      enableCreditCard: true,
      enableDebit: true,
      defaultDueDays: 7,
      defaultFine: 2,
      defaultInterest: 1,
    },
  });

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payment-gateway/config');
      const configs = response.data;

      // Find Asaas config
      const asaas = configs.find((c: any) => c.gateway === 'asaas' && c.isActive);
      if (asaas) {
        setAsaasConfig({
          ...asaas,
          config: typeof asaas.config === 'string' ? JSON.parse(asaas.config) : asaas.config,
        });
      }

      // Find PagBank config
      const pagbank = configs.find((c: any) => c.gateway === 'pagbank' && c.isActive);
      if (pagbank) {
        setPagbankConfig({
          ...pagbank,
          config: typeof pagbank.config === 'string' ? JSON.parse(pagbank.config) : pagbank.config,
        });
      }
    } catch (error: any) {
      console.error('Error loading configs:', error);
      // It's ok if no configs exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (config: PaymentConfig) => {
    try {
      setSaving(true);

      await api.post('/payment-gateway/config', config);

      toast.success(`Configuração do ${config.gateway === 'asaas' ? 'Asaas' : 'PagBank'} salva com sucesso!`);

      // Reload configs
      loadConfigs();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (gateway: 'asaas' | 'pagbank') => {
    try {
      setTesting(true);

      const response = await api.post(`/payment-gateway/test/${gateway}`);

      if (response.data.success) {
        const balanceMsg = response.data.balance?.balance
          ? ` | Saldo: R$ ${response.data.balance.balance.toFixed(2)}`
          : '';
        toast.success(`✅ Conexão com ${gateway === 'asaas' ? 'Asaas' : 'PagBank'} estabelecida com sucesso!${balanceMsg}`);
      }
    } catch (error: any) {
      toast.error(`❌ Erro ao testar conexão: ${error.response?.data?.error || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const renderAsaasConfig = () => {
    const config = asaasConfig;

    return (
      <div className="space-y-6">
        {/* Environment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ambiente</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="sandbox"
                checked={config.environment === 'sandbox'}
                onChange={(e) => setAsaasConfig({ ...config, environment: e.target.value as any })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Sandbox (Testes)
                <span className="ml-2 text-xs text-gray-500">Recomendado para iniciar</span>
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="production"
                checked={config.environment === 'production'}
                onChange={(e) => setAsaasConfig({ ...config, environment: e.target.value as any })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Production (Real)</span>
            </label>
          </div>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key *</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setAsaasConfig({ ...config, apiKey: e.target.value })}
            placeholder="$aact_..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Obtenha em: Asaas → Minha Conta → Integração → Gerar API Key
          </p>
        </div>

        {/* Webhook Secret */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Webhook Secret (Opcional)
          </label>
          <input
            type="password"
            value={config.webhookSecret || ''}
            onChange={(e) => setAsaasConfig({ ...config, webhookSecret: e.target.value })}
            placeholder="Secret compartilhado para validação"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Formas de Pagamento
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.config.enableBoleto}
                onChange={(e) =>
                  setAsaasConfig({
                    ...config,
                    config: { ...config.config, enableBoleto: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Boleto Bancário</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.config.enablePix}
                onChange={(e) =>
                  setAsaasConfig({
                    ...config,
                    config: { ...config.config, enablePix: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">PIX</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.config.enableCreditCard}
                onChange={(e) =>
                  setAsaasConfig({
                    ...config,
                    config: { ...config.config, enableCreditCard: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Cartão de Crédito</span>
            </label>
          </div>
        </div>

        {/* Default Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dias para Vencimento
            </label>
            <input
              type="number"
              value={config.config.defaultDueDays || 7}
              onChange={(e) =>
                setAsaasConfig({
                  ...config,
                  config: { ...config.config, defaultDueDays: parseInt(e.target.value) },
                })
              }
              min="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multa (%)</label>
            <input
              type="number"
              value={config.config.defaultFine || 2}
              onChange={(e) =>
                setAsaasConfig({
                  ...config,
                  config: { ...config.config, defaultFine: parseFloat(e.target.value) },
                })
              }
              min="0"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Juros/mês (%)
            </label>
            <input
              type="number"
              value={config.config.defaultInterest || 1}
              onChange={(e) =>
                setAsaasConfig({
                  ...config,
                  config: { ...config.config, defaultInterest: parseFloat(e.target.value) },
                })
              }
              min="0"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.isActive}
            onChange={(e) => setAsaasConfig({ ...config, isActive: e.target.checked })}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ativar integração</label>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => handleTestConnection('asaas')}
            disabled={!config.apiKey || testing}
            className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Testar Conexão
          </button>
          <button
            onClick={() => handleSaveConfig(config)}
            disabled={!config.apiKey || saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
            Salvar Configuração
          </button>
        </div>

        {/* Webhook URL Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📡 Configure o Webhook no Asaas
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            Cole esta URL no painel do Asaas para receber notificações automáticas:
          </p>
          <code className="block p-2 bg-white dark:bg-gray-800 rounded text-xs text-gray-900 dark:text-gray-100 break-all">
            https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas
          </code>
        </div>
      </div>
    );
  };

  const renderPagBankConfig = () => {
    const config = pagbankConfig;

    return (
      <div className="space-y-6">
        {/* Environment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ambiente</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="sandbox"
                checked={config.environment === 'sandbox'}
                onChange={(e) => setPagbankConfig({ ...config, environment: e.target.value as any })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Sandbox (Testes)
                <span className="ml-2 text-xs text-gray-500">Recomendado para iniciar</span>
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="production"
                checked={config.environment === 'production'}
                onChange={(e) => setPagbankConfig({ ...config, environment: e.target.value as any })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Production (Real)</span>
            </label>
          </div>
        </div>

        {/* API Key (Token) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Token de Acesso (API Key) *
          </label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setPagbankConfig({ ...config, apiKey: e.target.value })}
            placeholder="Bearer token..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Obtenha em: PagBank → Conta → Integrações → Gerar Token OAuth
          </p>
        </div>

        {/* Webhook Secret */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Webhook Secret (Opcional)
          </label>
          <input
            type="password"
            value={config.webhookSecret || ''}
            onChange={(e) => setPagbankConfig({ ...config, webhookSecret: e.target.value })}
            placeholder="Secret compartilhado para validação"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Formas de Pagamento
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.config.enableBoleto}
                onChange={(e) =>
                  setPagbankConfig({
                    ...config,
                    config: { ...config.config, enableBoleto: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Boleto Bancário</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.config.enablePix}
                onChange={(e) =>
                  setPagbankConfig({
                    ...config,
                    config: { ...config.config, enablePix: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">PIX</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.config.enableCreditCard}
                onChange={(e) =>
                  setPagbankConfig({
                    ...config,
                    config: { ...config.config, enableCreditCard: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Cartão de Crédito</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.config.enableDebit}
                onChange={(e) =>
                  setPagbankConfig({
                    ...config,
                    config: { ...config.config, enableDebit: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Cartão de Débito</span>
            </label>
          </div>
        </div>

        {/* Default Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dias para Vencimento
            </label>
            <input
              type="number"
              value={config.config.defaultDueDays || 7}
              onChange={(e) =>
                setPagbankConfig({
                  ...config,
                  config: { ...config.config, defaultDueDays: parseInt(e.target.value) },
                })
              }
              min="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multa (%)</label>
            <input
              type="number"
              value={config.config.defaultFine || 2}
              onChange={(e) =>
                setPagbankConfig({
                  ...config,
                  config: { ...config.config, defaultFine: parseFloat(e.target.value) },
                })
              }
              min="0"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Juros/mês (%)
            </label>
            <input
              type="number"
              value={config.config.defaultInterest || 1}
              onChange={(e) =>
                setPagbankConfig({
                  ...config,
                  config: { ...config.config, defaultInterest: parseFloat(e.target.value) },
                })
              }
              min="0"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.isActive}
            onChange={(e) => setPagbankConfig({ ...config, isActive: e.target.checked })}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ativar integração</label>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => handleTestConnection('pagbank')}
            disabled={!config.apiKey || testing}
            className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Testar Conexão
          </button>
          <button
            onClick={() => handleSaveConfig(config)}
            disabled={!config.apiKey || saving}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
            Salvar Configuração
          </button>
        </div>

        {/* Webhook URL Info */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
            📡 Configure o Webhook no PagBank
          </h4>
          <p className="text-sm text-green-800 dark:text-green-200 mb-2">
            Cole esta URL no painel do PagBank para receber notificações automáticas:
          </p>
          <code className="block p-2 bg-white dark:bg-gray-800 rounded text-xs text-gray-900 dark:text-gray-100 break-all">
            https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/pagbank
          </code>
          <p className="mt-2 text-xs text-green-700 dark:text-green-300">
            💡 Acesse: PagBank → Configurações → Notificações de Webhook
          </p>
        </div>

        {/* OAuth Authorization Info */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            🔐 Autorização OAuth - PagBank
          </h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            O PagBank utiliza OAuth 2.0 para autenticação. Você precisará autorizar o aplicativo para usar a API.
          </p>
          <ol className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
            <li>Acesse o painel do PagBank e vá em "Integrações"</li>
            <li>Crie uma nova aplicação OAuth</li>
            <li>Copie o Client ID e Client Secret</li>
            <li>Configure as permissões necessárias (payments, customers, webhooks)</li>
            <li>Autorize a aplicação e copie o Access Token</li>
            <li>Cole o Access Token no campo acima</li>
          </ol>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Integração de Pagamentos</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure os gateways de pagamento para receber cobranças via Boleto, PIX e Cartão
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('asaas')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'asaas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Asaas
            {asaasConfig.isActive && <CheckCircle className="w-3 h-3 ml-2 text-green-500" />}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('pagbank')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'pagbank'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            PagBank
            {pagbankConfig.isActive && <CheckCircle className="w-3 h-3 ml-2 text-green-500" />}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        {activeTab === 'asaas' ? renderAsaasConfig() : renderPagBankConfig()}
      </div>
    </div>
  );
};

export default PaymentGatewayConfig;
