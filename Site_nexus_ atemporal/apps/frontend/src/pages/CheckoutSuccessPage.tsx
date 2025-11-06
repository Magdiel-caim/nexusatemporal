import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CheckoutSuccessPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // You can track analytics here
    if (sessionId) {
      console.log('Payment successful:', sessionId);
      // Track conversion in analytics
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-6"
          >
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('checkout.success.title') || 'Pagamento Confirmado!'}
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-8"
          >
            {t('checkout.success.message') ||
              'Obrigado por escolher o Nexus Atemporal! Você receberá um email com as instruções de acesso em breve.'}
          </motion.p>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-6 mb-8 text-left"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('checkout.success.nextStepsTitle') || 'Próximos Passos:'}
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <span>
                  {t('checkout.success.step1') ||
                    'Verifique seu email (incluindo spam) para as credenciais de acesso'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <span>
                  {t('checkout.success.step2') ||
                    'Acesse o dashboard e complete seu perfil'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <span>
                  {t('checkout.success.step3') ||
                    'Configure suas preferências e comece a usar o sistema'}
                </span>
              </li>
            </ul>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="https://one.nexusatemporal.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="primary" className="w-full sm:w-auto">
                {t('checkout.success.accessDashboard') || 'Acessar Dashboard'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>

            <Link to="/">
              <Button variant="secondary" className="w-full sm:w-auto">
                {t('checkout.success.backHome') || 'Voltar ao Início'}
              </Button>
            </Link>
          </motion.div>

          {/* Support */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-8"
          >
            {t('checkout.success.support') ||
              'Precisa de ajuda? Entre em contato: '}{' '}
            <a
              href="mailto:contato@nexusatemporal.com.br"
              className="text-brand-500 hover:text-brand-600 underline"
            >
              contato@nexusatemporal.com.br
            </a>
          </motion.p>

          {sessionId && (
            <p className="text-xs text-gray-400 mt-4">
              ID da Sessão: {sessionId}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};
