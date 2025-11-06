'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CreditCard, Building, User, Mail, Lock, Check, Loader2 } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get plan and cycle from URL params
  const planName = searchParams.get('plan') || 'Profissional';
  const billingCycle = (searchParams.get('cycle') || 'monthly') as 'monthly' | 'yearly';

  // Form data
  const [formData, setFormData] = useState({
    // Clinic data
    clinicName: '',
    cnpj: '',
    phone: '',
    address: '',
    // Personal data
    fullName: '',
    email: '',
    cpf: '',
    password: '',
    // Agreements
    agreeTerms: false,
    acceptMarketing: true,
  });

  // Plan prices
  const planPrices: Record<string, { monthly: number; yearly: number | null }> = {
    'Essencial': { monthly: 297, yearly: 2970 },
    'Profissional': { monthly: 697, yearly: 6970 },
    'Empresarial': { monthly: 1497, yearly: 14970 },
    'Enterprise': { monthly: 2997, yearly: null },
  };

  const currentPrice = planPrices[planName];
  const displayPrice = billingCycle === 'monthly'
    ? currentPrice.monthly
    : currentPrice.yearly ? Math.floor(currentPrice.yearly / 12) : currentPrice.monthly;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      return !!(formData.clinicName && formData.cnpj && formData.phone && formData.address);
    }
    if (stepNum === 2) {
      return !!(formData.fullName && formData.email && formData.cpf && formData.password);
    }
    if (stepNum === 3) {
      return formData.agreeTerms;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setError('');
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          billingCycle,
          customerData: {
            email: formData.email,
            clinicName: formData.clinicName,
            cnpj: formData.cnpj,
            phone: formData.phone,
            address: formData.address,
            fullName: formData.fullName,
            cpf: formData.cpf,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Erro ao processar checkout. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Complete seu Cadastro
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              10 dias de trial gratuito • Sem compromisso
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Dados da Clínica</span>
              <span>Responsável</span>
              <span>Confirmação</span>
            </div>
          </div>

          {error && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <Building className="w-6 h-6 mr-2" />
                      Dados da Clínica
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome da Clínica *
                      </label>
                      <input
                        type="text"
                        value={formData.clinicName}
                        onChange={(e) => handleInputChange('clinicName', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Clínica Beleza Atemporal"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CNPJ *
                        </label>
                        <input
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => handleInputChange('cnpj', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Telefone *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Endereço Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Rua, número, complemento, bairro, cidade - UF"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <User className="w-6 h-6 mr-2" />
                      Dados do Responsável
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="João da Silva"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email (será seu login) *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="joao@clinica.com.br"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CPF *
                        </label>
                        <input
                          type="text"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange('cpf', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Criar Senha *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="Mínimo 8 caracteres"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Use letras maiúsculas, minúsculas e números
                      </p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <CreditCard className="w-6 h-6 mr-2" />
                      Confirmar Trial Gratuito
                    </h2>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        ✅ Trial de 10 dias GRATUITO
                      </h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Você não será cobrado agora. Após 10 dias, você pode escolher continuar com um plano pago ou cancelar sem custos.
                      </p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={formData.agreeTerms}
                        onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Concordo com os <a href="/termos" className="text-primary-600 hover:underline">Termos de Uso</a> e <a href="/privacidade" className="text-primary-600 hover:underline">Política de Privacidade</a> *
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={formData.acceptMarketing}
                        onChange={(e) => handleInputChange('acceptMarketing', e.target.checked)}
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Aceito receber emails com dicas, novidades e ofertas do Nexus Atemporal
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      disabled={loading}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      Voltar
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      step < 3 ? 'Continuar' : 'Ir para Pagamento'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Resumo do Pedido
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plano</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ciclo</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Trial</span>
                    <span className="font-semibold text-green-600">10 dias GRÁTIS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Após trial</span>
                    <span className="font-semibold text-gray-900 dark:text-white">R$ {displayPrice}/mês</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-600 dark:text-gray-400">Total hoje</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">R$ 0,00</div>
                      <div className="text-sm text-gray-500">Nada será cobrado</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Acesso completo por 10 dias</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Sem compromisso de continuidade</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Suporte incluído</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Cancele quando quiser</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
