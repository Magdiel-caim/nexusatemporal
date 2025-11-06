import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { initiateCheckout } from '@/services/payment.service';

export const Plans = () => {
  const { t } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'enterprise') {
      // For enterprise, scroll to contact form
      window.location.href = '#contact';
      return;
    }

    setLoadingPlan(planId);

    try {
      // In a real app, you would collect user email first
      // For now, we'll redirect to a checkout form
      // You can implement a modal to collect email before calling this
      const userEmail = prompt('Digite seu email para continuar:');

      if (!userEmail) {
        setLoadingPlan(null);
        return;
      }

      await initiateCheckout({
        planId,
        userEmail,
        countryCode: 'BR', // You can detect this or ask user
      });
    } catch (error: any) {
      alert(`Erro ao processar pagamento: ${error.message}`);
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'essencial',
      name: t('plans.essencial.name'),
      description: t('plans.essencial.description'),
      price: isAnnual ? t('plans.essencial.priceAnnual') : t('plans.essencial.price'),
      features: t('plans.essencial.features', { returnObjects: true }) as string[],
      popular: false,
    },
    {
      id: 'profissional',
      name: t('plans.profissional.name'),
      description: t('plans.profissional.description'),
      price: isAnnual ? t('plans.profissional.priceAnnual') : t('plans.profissional.price'),
      features: t('plans.profissional.features', { returnObjects: true }) as string[],
      popular: true,
      badge: t('plans.profissional.badge'),
    },
    {
      id: 'empresarial',
      name: t('plans.empresarial.name'),
      description: t('plans.empresarial.description'),
      price: isAnnual ? t('plans.empresarial.priceAnnual') : t('plans.empresarial.price'),
      features: t('plans.empresarial.features', { returnObjects: true }) as string[],
      popular: false,
    },
    {
      id: 'enterprise',
      name: t('plans.enterprise.name'),
      description: t('plans.enterprise.description'),
      price: isAnnual ? t('plans.enterprise.priceAnnual') : t('plans.enterprise.price'),
      features: t('plans.enterprise.features', { returnObjects: true }) as string[],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t('plans.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400"
          >
            {t('plans.subtitle')}
          </motion.p>
        </div>

        {/* Toggle Annual/Monthly */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`font-medium ${!isAnnual ? 'text-brand-500' : 'text-gray-500'}`}>
            {t('plans.monthly')}
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-16 h-8 rounded-full transition-colors ${
              isAnnual ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                isAnnual ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${isAnnual ? 'text-brand-500' : 'text-gray-500'}`}>
              {t('plans.annually')}
            </span>
            {isAnnual && (
              <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
                {t('plans.saveText')}
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`h-full flex flex-col relative ${
                  plan.popular ? 'border-2 border-brand-500 shadow-2xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-gray-500">R$</span>
                    <span className="text-4xl font-bold numeric">{plan.price}</span>
                    <span className="text-gray-500">{t('plans.perMonth')}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('plans.billed')} {isAnnual ? t('plans.annually') : t('plans.monthly')}
                  </p>
                </div>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full mb-6"
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.id
                    ? 'Processando...'
                    : plan.id === 'enterprise'
                      ? t('plans.contact')
                      : t('plans.trial')
                  }
                </Button>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
