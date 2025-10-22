import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PricingCards } from '@/components/PricingCards';
import { PricingComparison } from '@/components/PricingComparison';
import { AddOns } from '@/components/AddOns';
import { Check } from 'lucide-react';

export default function PlanosPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-primary-950 dark:via-secondary-950 dark:to-accent-950">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Escolha o Plano Ideal
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                Para Sua Clínica
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Comece com 10 dias grátis. Sem cartão de crédito. Cancele quando quiser.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>10 dias grátis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>Sem cartão necessário</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>Cancele a qualquer momento</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-success" />
                <span>Garantia de 30 dias</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-4">
          <PricingCards />
        </section>

        {/* Comparison Table */}
        <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Comparação Completa
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-12">
              Veja em detalhes o que está incluído em cada plano
            </p>
            <PricingComparison />
          </div>
        </section>

        {/* Add-ons */}
        <section className="py-20 px-4">
          <AddOns />
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ainda em dúvida sobre qual plano escolher?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Nossa equipe está pronta para te ajudar a escolher o plano perfeito para sua clínica
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:contato@nexustemporal.com.br"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                Falar com Especialista
              </a>
              <a
                href="https://wa.me/5511999999999"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
