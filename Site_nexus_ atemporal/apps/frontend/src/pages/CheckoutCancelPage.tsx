import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CheckoutCancelPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center"
        >
          {/* Cancel Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6"
          >
            <XCircle className="w-16 h-16 text-orange-600 dark:text-orange-400" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('checkout.cancel.title') || 'Pagamento Cancelado'}
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-8"
          >
            {t('checkout.cancel.message') ||
              'Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada.'}
          </motion.p>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 text-left"
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('checkout.cancel.helpTitle') || 'Precisa de Ajuda?'}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t('checkout.cancel.helpMessage') ||
                    'Se você teve algum problema ou dúvida durante o processo, estamos aqui para ajudar!'}
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    📧 Email:{' '}
                    <a
                      href="mailto:contato@nexusatemporal.com.br"
                      className="text-brand-500 hover:text-brand-600 underline"
                    >
                      contato@nexusatemporal.com.br
                    </a>
                  </li>
                  <li>
                    💬 WhatsApp:{' '}
                    <a
                      href="https://wa.me/5511999999999"
                      className="text-brand-500 hover:text-brand-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      (11) 99999-9999
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/#pricing">
              <Button variant="primary" className="w-full sm:w-auto">
                {t('checkout.cancel.tryAgain') || 'Tentar Novamente'}
              </Button>
            </Link>

            <Link to="/">
              <Button variant="secondary" className="w-full sm:w-auto">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('checkout.cancel.backHome') || 'Voltar ao Início'}
              </Button>
            </Link>
          </motion.div>

          {/* Reassurance */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-8"
          >
            {t('checkout.cancel.reassurance') ||
              'Seus dados estão seguros e não foram salvos. Você pode tentar novamente quando quiser.'}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};
