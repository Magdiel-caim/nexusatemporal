'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'O trial gratuito realmente não precisa de cartão?',
    answer: 'Sim! Oferecemos 10 dias de trial GRATUITO do plano Profissional, sem necessidade de cadastrar cartão de crédito. Você pode explorar todas as funcionalidades sem compromisso.',
  },
  {
    question: 'Posso migrar meus dados de outro sistema?',
    answer: 'Sim! Nossa equipe oferece suporte completo para migração de dados de planilhas, outros CRMs ou sistemas. O processo é rápido e seguro, geralmente concluído em 24-48h.',
  },
  {
    question: 'Os dados dos meus clientes estão seguros?',
    answer: 'Absolutamente! Utilizamos criptografia de ponta a ponta, backups diários automáticos e estamos 100% em conformidade com a LGPD. Seus dados ficam em servidores no Brasil.',
  },
  {
    question: 'Posso fazer upgrade ou downgrade a qualquer momento?',
    answer: 'Sim! Você pode mudar de plano quando quiser. No upgrade, o valor é calculado proporcionalmente. No downgrade, o crédito é mantido para os próximos meses.',
  },
  {
    question: 'O que acontece se eu ultrapassar os limites do meu plano?',
    answer: 'Você receberá notificações quando atingir 80% e 90% dos limites. Ao atingir 100%, sugerimos um upgrade. Seus dados NUNCA são bloqueados ou perdidos.',
  },
  {
    question: 'Vocês oferecem treinamento?',
    answer: 'Sim! Todos os planos incluem onboarding e tutoriais em vídeo. Planos Enterprise e Empresarial têm treinamento personalizado e gerente de sucesso dedicado.',
  },
  {
    question: 'Posso comprar módulos adicionais separadamente?',
    answer: 'Sim! Você pode adicionar usuários extras, números de WhatsApp, armazenamento, filiais e outros recursos conforme sua necessidade cresce.',
  },
  {
    question: 'Como funciona a integração com WhatsApp?',
    answer: 'Conectamos seu número via QR Code (igual WhatsApp Web). Você atende clientes direto no CRM, com histórico completo, chatbot e automações. Funciona com WhatsApp Business e normal.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tudo que você precisa saber sobre o Nexus Atemporal
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 animate-slide-down">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ainda tem dúvidas?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Nossa equipe está pronta para ajudar você a escolher o melhor plano
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contato@nexustemporal.com.br"
              className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Falar com Especialista
            </a>
            <a
              href="https://wa.me/5511999999999"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
