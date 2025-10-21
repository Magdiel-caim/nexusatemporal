import Link from 'next/link';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-primary-950 dark:via-secondary-950 dark:to-accent-950 opacity-50" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              10 dias de trial gratuito • Sem cartão de crédito
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 mb-6 animate-slide-up">
            CRM Completo para
            <br />
            Clínicas de Estética
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Gestão, Automação e IA em um só lugar. Aumente sua receita, reduza custos e encante seus clientes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/planos"
              className="group bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Começar Trial Gratuito</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Ver Demo</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center space-y-4 text-gray-600 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-white dark:border-gray-900" />
                ))}
              </div>
              <span className="text-sm">
                <strong className="text-gray-900 dark:text-white">+500 clínicas</strong> confiam no Nexus
              </span>
            </div>
            <p className="text-sm">
              ⭐⭐⭐⭐⭐ <strong>4.9/5</strong> baseado em 300+ avaliações
            </p>
          </div>
        </div>

        {/* Screenshot/Demo */}
        <div className="mt-16 max-w-6xl mx-auto animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20" />
            <div className="bg-white dark:bg-gray-900 p-8">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-xl">
                  🎯 Screenshot do Dashboard Aqui
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
