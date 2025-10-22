import { Sparkles, Calendar, FileText, MessageSquare, Zap, TrendingUp, Users, Briefcase } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Gestão de Leads',
    description: 'Capture, qualifique e converta leads com IA. Kanban inteligente que prioriza automaticamente.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'Prontuários Eletrônicos',
    description: 'Prontuários digitais completos com fotos, evoluções e assinatura digital. Totalmente LGPD.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Integrado',
    description: 'Atenda seus clientes direto no CRM. Múltiplos números, chatbot e automações.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Automações n8n',
    description: 'Automatize tudo: lembretes, follow-ups, relatórios. Poupe horas de trabalho manual.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: TrendingUp,
    title: 'BI com OpenAI',
    description: 'Dashboards inteligentes que respondem perguntas em linguagem natural sobre seu negócio.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Sincronização com Google Calendar, lembretes automáticos e gestão de profissionais.',
    color: 'from-teal-500 to-green-500',
  },
  {
    icon: Briefcase,
    title: 'Financeiro Completo',
    description: 'Controle total: contas a pagar/receber, comissões, DRE e integração com gateways.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Sparkles,
    title: 'Estoque Inteligente',
    description: 'Controle de produtos, movimentações e alertas de estoque baixo automáticos.',
    color: 'from-pink-500 to-rose-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tudo que sua clínica precisa
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Um CRM completo que cresce com seu negócio. Não é só software, é seu parceiro de crescimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-transparent hover:shadow-2xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
