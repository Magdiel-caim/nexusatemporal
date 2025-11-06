'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CheckCircle, ArrowRight, Mail, Video, BookOpen, Loader2, Rocket } from 'lucide-react';
import Link from 'next/link';

function ObrigadoContent() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('session_id');
    setSessionId(id);
  }, [searchParams]);

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-scale-in shadow-2xl">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
              🎉 Bem-vindo ao Nexus Atemporal!
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Sua assinatura foi criada com sucesso
            </p>

            {/* Trial Success Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Trial de 10 Dias Ativado
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Você tem acesso completo a todos os recursos do seu plano por 10 dias, totalmente grátis.
                    Após esse período, a cobrança será automática, mas você pode cancelar a qualquer momento.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Sent Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-12 animate-slide-up" style={{ animationDelay: '0.25s' }}>
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
              href="https://one.nexusatemporal.com.br"
              target="_blank"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-10 py-5 rounded-lg font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all mb-16 animate-scale-in"
              style={{ animationDelay: '0.3s' }}
            >
              <Rocket className="w-5 h-5" />
              <span>Acessar Plataforma Agora</span>
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

            {/* Support */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                💬 Precisa de Ajuda?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Nossa equipe está pronta para ajudar você a começar.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="mailto:suporte@nexusatemporal.com.br"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  suporte@nexusatemporal.com.br
                </a>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

            {sessionId && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                ID da Sessão: {sessionId}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <ObrigadoContent />
    </Suspense>
  );
}
