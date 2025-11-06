import { Users, FileText, MessageSquare, Zap, TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    icon: Users,
    name: 'Leads & CRM',
    description: 'Gestão completa de leads com funil de vendas, pipeline e automações',
    features: ['Kanban inteligente', 'Pontuação de leads', 'Automações de follow-up', 'Relatórios de conversão'],
    plans: ['Essencial', 'Profissional', 'Empresarial', 'Enterprise'],
  },
  {
    icon: FileText,
    name: 'Prontuários',
    description: 'Prontuários eletrônicos completos com fotos, anamnese e evoluções',
    features: ['Fotos antes/depois', 'Assinatura digital', 'Templates personalizados', 'Histórico completo'],
    plans: ['Profissional', 'Empresarial', 'Enterprise'],
  },
  {
    icon: MessageSquare,
    name: 'WhatsApp',
    description: 'Atendimento multicanal com WhatsApp, Instagram e Facebook',
    features: ['Múltiplos números', 'Chatbot integrado', 'Respostas rápidas', 'Histórico unificado'],
    plans: ['Profissional', 'Empresarial', 'Enterprise'],
  },
  {
    icon: Zap,
    name: 'Automações',
    description: 'Fluxos de trabalho automatizados com n8n e Typebot',
    features: ['Workflows ilimitados', 'Integrações nativas', 'Triggers personalizados', 'Chatbots'],
    plans: ['Profissional', 'Empresarial', 'Enterprise'],
  },
  {
    icon: TrendingUp,
    name: 'Business Intelligence',
    description: 'Dashboards e relatórios com IA da OpenAI',
    features: ['Perguntas em linguagem natural', 'Previsões de receita', 'Análise de churn', 'KPIs em tempo real'],
    plans: ['Empresarial', 'Enterprise'],
  },
  {
    icon: DollarSign,
    name: 'Financeiro',
    description: 'Gestão financeira completa com DRE, comissões e pagamentos',
    features: ['Contas a pagar/receber', 'Comissões automáticas', 'Conciliação bancária', 'DRE automático'],
    plans: ['Essencial', 'Profissional', 'Empresarial', 'Enterprise'],
  },
  {
    icon: Package,
    name: 'Estoque',
    description: 'Controle de produtos, fornecedores e movimentações',
    features: ['Alertas de estoque baixo', 'Rastreamento de lotes', 'Inventário periódico', 'Relatórios de giro'],
    plans: ['Profissional', 'Empresarial', 'Enterprise'],
  },
  {
    icon: Calendar,
    name: 'Agenda',
    description: 'Agendamento inteligente com sincronização Google Calendar',
    features: ['Múltiplos profissionais', 'Bloqueio de horários', 'Lembretes automáticos', 'Lista de espera'],
    plans: ['Essencial', 'Profissional', 'Empresarial', 'Enterprise'],
  },
];

export function Modules() {
  return (
    <section id="modulos" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Módulos Especializados
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Cada módulo foi desenvolvido especificamente para clínicas de estética. Compre apenas o que precisa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <div
              key={module.name}
              className="bg-white dark:bg-gray-900 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-xl animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                  {module.plans.length} planos
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {module.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {module.description}
              </p>

              <div className="space-y-2 mb-6">
                {module.features.map((feature) => (
                  <div key={feature} className="flex items-start space-x-2 text-sm">
                    <span className="text-success mt-0.5">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Disponível em:</p>
                <div className="flex flex-wrap gap-1">
                  {module.plans.map((plan) => (
                    <span
                      key={plan}
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                    >
                      {plan}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/planos"
            className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Ver Todos os Planos
          </Link>
        </div>
      </div>
    </section>
  );
}
