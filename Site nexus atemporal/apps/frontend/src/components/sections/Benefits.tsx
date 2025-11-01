import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, Zap, BarChart3, Shield, Headphones } from 'lucide-react';
import { Card } from '../ui/Card';

export const Benefits = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Brain,
      title: t('benefits.aiPowered.title'),
      description: t('benefits.aiPowered.description'),
      color: 'text-brand-500',
      bgColor: 'bg-brand-50 dark:bg-brand-900/20',
    },
    {
      icon: MessageCircle,
      title: t('benefits.multiChannel.title'),
      description: t('benefits.multiChannel.description'),
      color: 'text-blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Zap,
      title: t('benefits.automation.title'),
      description: t('benefits.automation.description'),
      color: 'text-accent',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
      icon: BarChart3,
      title: t('benefits.analytics.title'),
      description: t('benefits.analytics.description'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Shield,
      title: t('benefits.security.title'),
      description: t('benefits.security.description'),
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Headphones,
      title: t('benefits.support.title'),
      description: t('benefits.support.description'),
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="features" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t('benefits.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400"
          >
            {t('benefits.subtitle')}
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full">
                <div className={`w-16 h-16 ${benefit.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
