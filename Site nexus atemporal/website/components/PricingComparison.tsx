import { Check, X, Minus } from 'lucide-react';

const comparisonData = [
  {
    category: 'LIMITES E CAPACIDADE',
    items: [
      { feature: 'Usuários', essencial: '1', profissional: '5', empresarial: '15', enterprise: '∞' },
      { feature: 'Clientes Ativos', essencial: '100', profissional: '500', empresarial: '2.000', enterprise: '∞' },
      { feature: 'Agendamentos/Mês', essencial: '200', profissional: '1.000', empresarial: '5.000', enterprise: '∞' },
      { feature: 'Profissionais', essencial: '1', profissional: '5', empresarial: '15', enterprise: '∞' },
      { feature: 'Armazenamento', essencial: '-', profissional: '10 GB', empresarial: '50 GB', enterprise: '500 GB' },
    ],
  },
  {
    category: 'MÓDULOS PRINCIPAIS',
    items: [
      { feature: 'Dashboard', essencial: 'Básico', profissional: 'Avançado', empresarial: 'Completo + IA', enterprise: 'Completo + IA' },
      { feature: 'Gestão de Leads', essencial: true, profissional: true, empresarial: true, enterprise: true },
      { feature: 'Agenda', essencial: 'Básica', profissional: '+ Google Cal', empresarial: '+ Google Cal', enterprise: '+ Google Cal' },
      { feature: 'Prontuários', essencial: false, profissional: true, empresarial: true, enterprise: true },
      { feature: 'Financeiro', essencial: 'Básico', profissional: 'Completo', empresarial: 'Completo', enterprise: 'Completo' },
      { feature: 'Estoque', essencial: false, profissional: true, empresarial: true, enterprise: true },
    ],
  },
  {
    category: 'COMUNICAÇÃO',
    items: [
      { feature: 'WhatsApp', essencial: false, profissional: '1 número', empresarial: '3 números', enterprise: 'Ilimitado' },
      { feature: 'Instagram Direct', essencial: false, profissional: false, empresarial: true, enterprise: true },
      { feature: 'Facebook Messenger', essencial: false, profissional: false, empresarial: true, enterprise: true },
      { feature: 'Email Integration', essencial: false, profissional: false, empresarial: true, enterprise: true },
    ],
  },
  {
    category: 'AUTOMAÇÕES E IA',
    items: [
      { feature: 'n8n Workflows', essencial: false, profissional: '5 ativos', empresarial: 'Ilimitados', enterprise: 'Ilimitados' },
      { feature: 'Typebot Chatbot', essencial: false, profissional: '1 fluxo', empresarial: 'Ilimitado', enterprise: 'Ilimitado' },
      { feature: 'OpenAI (IA)', essencial: false, profissional: 'Básica', empresarial: 'Avançada', enterprise: 'Ilimitada' },
      { feature: 'IA Clínica', essencial: false, profissional: false, empresarial: true, enterprise: true },
    ],
  },
  {
    category: 'AVANÇADO',
    items: [
      { feature: 'Multi-unidades', essencial: false, profissional: false, empresarial: '3 filiais', enterprise: 'Ilimitado' },
      { feature: 'API Aberta', essencial: false, profissional: false, empresarial: true, enterprise: true },
      { feature: 'White Label', essencial: false, profissional: false, empresarial: 'Parcial', enterprise: 'Completo' },
      { feature: 'Suporte', essencial: 'Email', profissional: 'Chat', empresarial: 'Prioritário', enterprise: 'Dedicado' },
    ],
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-success mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-400 mx-auto" />
    );
  }
  if (value === '-') {
    return <Minus className="w-5 h-5 text-gray-400 mx-auto" />;
  }
  return <span className="text-gray-900 dark:text-white font-medium">{value}</span>;
}

export function PricingComparison() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
            <th className="p-4 text-left rounded-tl-lg">Funcionalidade</th>
            <th className="p-4 text-center">Essencial</th>
            <th className="p-4 text-center">Profissional</th>
            <th className="p-4 text-center">Empresarial</th>
            <th className="p-4 text-center rounded-tr-lg">Enterprise</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {comparisonData.map((category, catIndex) => (
            <>
              <tr key={category.category} className="bg-primary-50 dark:bg-primary-950/30">
                <td colSpan={5} className="p-3 font-bold text-primary-900 dark:text-primary-100">
                  {category.category}
                </td>
              </tr>
              {category.items.map((item, itemIndex) => (
                <tr
                  key={item.feature}
                  className={`border-b border-gray-200 dark:border-gray-800 ${
                    itemIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                  } hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors`}
                >
                  <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{item.feature}</td>
                  <td className="p-4 text-center"><CellValue value={item.essencial} /></td>
                  <td className="p-4 text-center"><CellValue value={item.profissional} /></td>
                  <td className="p-4 text-center"><CellValue value={item.empresarial} /></td>
                  <td className="p-4 text-center"><CellValue value={item.enterprise} /></td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
