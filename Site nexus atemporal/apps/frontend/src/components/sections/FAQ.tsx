import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Como funciona o trial de 10 dias?',
      answer: 'Você tem acesso completo a todos os recursos do plano escolhido por 10 dias, sem precisar cadastrar cartão de crédito. Após o período, você pode escolher continuar com um plano pago ou cancelar sem custos.',
    },
    {
      question: 'Posso mudar de plano depois?',
      answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente e o valor é ajustado proporcionalmente.',
    },
    {
      question: 'Quais formas de pagamento são aceitas?',
      answer: 'Aceitamos cartão de crédito, PIX e boleto bancário. Para planos anuais, oferecemos descontos especiais.',
    },
    {
      question: 'Meus dados estão seguros?',
      answer: 'Sim! Utilizamos criptografia de ponta a ponta, backup automático diário e seguimos todas as normas da LGPD. Seus dados nunca serão compartilhados com terceiros.',
    },
    {
      question: 'O sistema funciona offline?',
      answer: 'Algumas funcionalidades básicas funcionam offline, mas para sincronização completa e recursos de IA é necessária conexão com internet.',
    },
    {
      question: 'Tenho suporte técnico incluído?',
      answer: 'Sim! Todos os planos incluem suporte por email. Planos Empresarial e Enterprise têm suporte prioritário via WhatsApp e gerente dedicado.',
    },
    {
      question: 'Posso integrar com outros sistemas?',
      answer: 'Sim! Oferecemos API REST completa e integrações nativas com principais plataformas de pagamento, marketing e comunicação.',
    },
    {
      question: 'Como funciona a garantia de 30 dias?',
      answer: 'Se você não ficar satisfeito com o sistema nos primeiros 30 dias, devolvemos 100% do valor pago, sem perguntas.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t('faq.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400"
          >
            {t('faq.subtitle')}
          </motion.p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full bg-white dark:bg-gray-800 rounded-xl p-6 text-left transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold pr-8">{faq.question}</h3>
                  <ChevronDown
                    className={`w-6 h-6 text-brand-500 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
