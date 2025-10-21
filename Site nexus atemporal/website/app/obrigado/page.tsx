import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckCircle, ArrowRight, Mail, Video, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ObrigadoPage() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
              Bem-vindo ao Nexus Atemporal!
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Sua conta foi criada com sucesso e está pronta para uso
            </p>

            {/* Email Sent Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Verifique seu email
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Enviamos um email de boas-vindas com suas credenciais de acesso e próximos passos.
                    <br />
                    <strong>Verifique também sua caixa de spam.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="https://app.nexustemporal.com.br"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-10 py-5 rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all mb-16 animate-scale-in"
              style={{ animationDelay: '0.3s' }}
            >
              <span>Acessar Sistema Agora</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* Next Steps */}
            <div className="text-left mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Próximos Passos
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    1. Assista o Tutorial
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Vídeo rápido de 5 minutos mostrando como configurar sua clínica
                  </p>
                  <a href="#" className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:underline">
                    Assistir agora →
                  </a>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    2. Explore os Módulos
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Conheça cada recurso disponível no seu plano
                  </p>
                  <a href="#" className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:underline">
                    Ver documentação →
                  </a>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    3. Fale com Suporte
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Nossa equipe está pronta para ajudar você
                  </p>
                  <a href="https://wa.me/5511999999999" className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:underline">
                    WhatsApp →
                  </a>
                </div>
              </div>
            </div>

            {/* Trial Info */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-2">
                Seu trial de 10 dias começou agora!
              </h3>
              <p className="text-lg opacity-90 mb-4">
                Explore TODAS as funcionalidades sem limitações. Não vamos pedir cartão de crédito.
              </p>
              <p className="text-sm opacity-75">
                Ao final do trial, você pode escolher um plano pago ou cancelar. Simples assim.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
