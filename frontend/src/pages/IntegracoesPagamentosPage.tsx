/**
 * Integrações de Pagamentos Page
 *
 * Página específica para configuração de gateways de pagamento
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentGatewayConfig from '../components/payment-gateway/PaymentGatewayConfig';

const IntegracoesPagamentosPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/configuracoes')}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Configurações
        </button>

        {/* Payment Gateway Config Component */}
        <PaymentGatewayConfig />
      </div>
    </div>
  );
};

export default IntegracoesPagamentosPage;
