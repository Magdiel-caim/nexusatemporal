'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, AlertCircle } from 'lucide-react';

const plans = [
  {
    name: 'Essencial',
    icon: '🌱',
    subtitle: 'Para clínicas iniciantes',
    price: { monthly: 297, yearly: 2970 },
    popular: false,
    features: [
      { text: '1 usuário', included: 'limited' },
      { text: '100 clientes ativos', included: 'limited' },
      { text: '200 agendamentos/mês', included: 'limited' },
      { text: '1 profissional', included: 'limited' },
      { text: 'Dashboard básico', included: true },
      { text: 'Gestão de Leads', included: true },
      { text: 'Agenda básica', included: true },
      { text: 'Financeiro básico', included: true },
      { text: '1 gateway pagamento', included: true },
      { text: 'Prontuários', included: false },
      { text: 'WhatsApp', included: false },
      { text: 'Automações', included: false },
      { text: 'IA', included: false },
    ],
  },
  {
    name: 'Profissional',
    icon: '⚡',
    subtitle: 'Para clínicas em crescimento',
    price: { monthly: 697, yearly: 6970 },
    popular: true,
    features: [
      { text: '5 usuários', included: 'limited' },
      { text: '500 clientes ativos', included: 'limited' },
      { text: '1.000 agendamentos/mês', included: 'limited' },
      { text: '5 profissionais', included: 'limited' },
      { text: '10 GB armazenamento', included: 'limited' },
      { text: 'Dashboard avançado', included: true },
      { text: 'Prontuários eletrônicos', included: true },
      { text: '1 número WhatsApp', included: true },
      { text: 'Financeiro completo', included: true },
      { text: 'Estoque', included: true },
      { text: '5 automações n8n', included: true },
      { text: 'IA básica', included: true },
      { text: '2 gateways', included: true },
    ],
  },
  {
    name: 'Empresarial',
    icon: '🚀',
    subtitle: 'Para clínicas estabelecidas',
    price: { monthly: 1497, yearly: 14970 },
    popular: false,
    features: [
      { text: '15 usuários', included: 'limited' },
      { text: '2.000 clientes', included: 'limited' },
      { text: '5.000 agendamentos/mês', included: 'limited' },
      { text: '15 profissionais', included: 'limited' },
      { text: '50 GB armazenamento', included: 'limited' },
      { text: '3 números WhatsApp', included: 'limited' },
      { text: 'Tudo do Profissional +', included: true },
      { text: 'Automações ilimitadas', included: true },
      { text: 'IA Clínica completa', included: true },
      { text: 'BI com OpenAI', included: true },
      { text: 'Marketing (Mautic)', included: true },
      { text: '3 filiais', included: true },
      { text: 'API aberta', included: true },
    ],
  },
  {
    name: 'Enterprise',
    icon: '👑',
    subtitle: 'Para redes de clínicas',
    price: { monthly: 2997, yearly: null },
    popular: false,
    features: [
      { text: 'Usuários ilimitados', included: true },
      { text: 'Clientes ilimitados', included: true },
      { text: 'Agendamentos ilimitados', included: true },
      { text: '500 GB armazenamento', included: 'limited' },
      { text: 'WhatsApp ilimitado', included: true },
      { text: 'Tudo do Empresarial +', included: true },
      { text: 'Gestão de redes', included: true },
      { text: 'SLA prioritário', included: true },
      { text: 'Gerente dedicado', included: true },
      { text: 'Customizações', included: true },
      { text: 'White Label completo', included: true },
      { text: 'Infraestrutura dedicada', included: true },
    ],
  },
];

export function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="container mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Anual
            <span className="ml-2 text-xs bg-success/20 text-success px-2 py-1 rounded">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 p-8 ${
              plan.popular
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/50 dark:to-secondary-950/50 shadow-xl scale-105'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
            } hover:shadow-2xl transition-all duration-300 animate-scale-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  ⭐ MAIS POPULAR
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{plan.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{plan.subtitle}</p>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  R$ {billingCycle === 'monthly' ? plan.price.monthly : (plan.price.yearly ? Math.floor(plan.price.yearly / 12) : plan.price.monthly)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/mês</span>
              </div>
              {billingCycle === 'yearly' && plan.price.yearly && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  R$ {plan.price.yearly}/ano (2 meses grátis)
                </p>
              )}
              {plan.price.yearly === null && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Contrato anual sob consulta
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature.text} className="flex items-start space-x-2 text-sm">
                  {feature.included === true && (
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  )}
                  {feature.included === 'limited' && (
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  )}
                  {feature.included === false && (
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.included === false ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={`/checkout?plan=${encodeURIComponent(plan.name)}&cycle=${billingCycle}`}
              className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {plan.name === 'Profissional' ? 'Começar Trial Gratuito' : 'Comprar Agora'}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
