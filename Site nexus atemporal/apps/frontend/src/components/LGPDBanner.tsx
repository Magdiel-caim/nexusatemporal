import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLGPDStore } from '@/store/lgpd.store';
import { Button } from './ui/Button';

export const LGPDBanner = () => {
  const { t } = useTranslation();
  const { hasInteracted, acceptCookies } = useLGPDStore();

  if (hasInteracted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <div className="container-custom">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  🍪 {t('lgpd.message')}{' '}
                  <a
                    href="/privacy"
                    className="text-brand-500 hover:text-brand-600 underline"
                  >
                    {t('lgpd.policy')}
                  </a>
                  .
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Open cookie management modal
                    acceptCookies();
                  }}
                >
                  {t('lgpd.manage')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={acceptCookies}
                >
                  {t('lgpd.accept')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
