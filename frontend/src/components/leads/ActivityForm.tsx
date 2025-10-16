import { useState, FormEvent } from 'react';
import { Activity } from '@/services/leadsService';
import toast from 'react-hot-toast';

interface ActivityFormProps {
  onSubmit: (data: Partial<Activity>) => Promise<void>;
  onCancel: () => void;
}

export default function ActivityForm({ onSubmit, onCancel }: ActivityFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'note',
    title: '',
    description: '',
    scheduledAt: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const submitData: Partial<Activity> = {
        type: formData.type as any,
        title: formData.title,
        description: formData.description || undefined,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
      };

      await onSubmit(submitData);
      toast.success('Atividade criada com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar atividade');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo de Atividade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tipo de Atividade <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        >
          <option value="note">📝 Nota</option>
          <option value="call">📞 Ligação</option>
          <option value="email">📧 E-mail</option>
          <option value="meeting">📅 Reunião</option>
          <option value="task">✅ Tarefa</option>
          <option value="whatsapp">💬 WhatsApp</option>
          <option value="sms">📱 SMS</option>
          <option value="other">🔹 Outro</option>
        </select>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ex: Ligar para agendar consulta"
          required
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Detalhes da atividade..."
          rows={3}
        />
      </div>

      {/* Data/Hora Agendada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Agendar para
        </label>
        <input
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={(e) => handleChange('scheduledAt', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Opcional: Defina uma data/hora para ser lembrado desta atividade
        </p>
      </div>

      {/* Botões */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar Atividade'}
        </button>
      </div>
    </form>
  );
}
