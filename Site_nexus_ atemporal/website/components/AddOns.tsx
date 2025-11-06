import { User, Phone, HardDrive, Building, GraduationCap, Wrench } from 'lucide-react';

const addons = [
  {
    icon: User,
    title: 'Usuário Adicional',
    price: 49,
    unit: '/mês',
    description: 'Adicione mais um usuário ao seu plano atual',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Phone,
    title: 'Número WhatsApp Extra',
    price: 97,
    unit: '/mês',
    description: 'Conecte números adicionais de WhatsApp',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: HardDrive,
    title: '50 GB Armazenamento',
    price: 47,
    unit: '/mês',
    description: 'Amplie seu espaço de armazenamento',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Building,
    title: 'Unidade/Filial Adicional',
    price: 297,
    unit: '/mês',
    description: 'Adicione mais uma unidade ao sistema',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: GraduationCap,
    title: 'Treinamento Personalizado',
    price: 497,
    unit: 'único',
    description: 'Sessão de treinamento de 4h para equipe',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Wrench,
    title: 'Integração Customizada',
    price: null,
    unit: 'sob consulta',
    description: 'Desenvolvemos integração específica',
    color: 'from-teal-500 to-green-500',
  },
];

export function AddOns() {
  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Add-ons Disponíveis
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Expanda as capacidades do seu plano com recursos adicionais conforme sua necessidade
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map((addon, index) => (
          <div
            key={addon.title}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-xl transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${addon.color} flex items-center justify-center mb-4`}>
              <addon.icon className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {addon.title}
            </h3>

            <div className="mb-4">
              {addon.price ? (
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    R$ {addon.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    {addon.unit}
                  </span>
                </div>
              ) : (
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {addon.unit}
                </div>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {addon.description}
            </p>

            <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Adicionar ao Plano
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Precisa de algo específico?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Entre em contato e vamos criar uma solução personalizada para sua clínica
        </p>
        <a
          href="mailto:contato@nexustemporal.com.br"
          className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Solicitar Orçamento
        </a>
      </div>
    </div>
  );
}
