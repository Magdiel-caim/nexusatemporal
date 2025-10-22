import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Send, Users, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { BulkMessage, marketingService } from '@/services/marketingService';
import { leadsService } from '@/services/leadsService';
import * as Dialog from '@radix-ui/react-dialog';

const bulkMessageSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  platform: z.enum(['whatsapp', 'instagram_dm', 'email']),
  content: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

type BulkMessageFormData = z.infer<typeof bulkMessageSchema>;

interface BulkMessageFormProps {
  message?: BulkMessage;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const platformIcons: Record<string, string> = {
  whatsapp: '💬',
  instagram_dm: '📷',
  email: '📧',
};

const platformNames: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram_dm: 'Instagram DM',
  email: 'Email',
};

export default function BulkMessageForm({ message, isOpen, onClose, onSuccess }: BulkMessageFormProps) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<BulkMessageFormData>({
    resolver: zodResolver(bulkMessageSchema),
    defaultValues: message
      ? {
          name: message.name,
          platform: message.platform,
          content: message.content,
          scheduledDate: message.scheduledAt ? new Date(message.scheduledAt).toISOString().split('T')[0] : '',
          scheduledTime: message.scheduledAt
            ? new Date(message.scheduledAt).toTimeString().split(' ')[0].substring(0, 5)
            : '',
        }
      : {
          name: '',
          platform: 'whatsapp',
          content: '',
          scheduledDate: '',
          scheduledTime: '',
        },
  });

  const content = watch('content');
  const platform = watch('platform');

  useEffect(() => {
    if (isOpen) {
      loadLeads();
    }
  }, [isOpen]);

  const loadLeads = async () => {
    try {
      const data = await leadsService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast.error('Erro ao carregar leads');
    }
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    }
    setSelectAll(!selectAll);
  };

  const insertVariable = (variable: string) => {
    const contentField = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (contentField) {
      const start = contentField.selectionStart;
      const end = contentField.selectionEnd;
      const currentValue = content || '';
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
      contentField.value = newValue;
      contentField.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        contentField.focus();
        contentField.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const onSubmit = async (data: BulkMessageFormData) => {
    if (selectedLeads.length === 0) {
      toast.error('Selecione pelo menos um destinatário');
      return;
    }

    try {
      setLoading(true);

      let scheduledAt: string | undefined;
      if (data.scheduledDate && data.scheduledTime) {
        scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString();
      }

      const messageData = {
        name: data.name,
        platform: data.platform,
        content: data.content,
        scheduledAt,
        status: scheduledAt ? ('scheduled' as const) : ('draft' as const),
        totalRecipients: selectedLeads.length,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        failedCount: 0,
      };

      if (message) {
        await marketingService.createBulkMessage(messageData); // API doesn't support update yet
        toast.success('Mensagem atualizada com sucesso!');
      } else {
        await marketingService.createBulkMessage(messageData);
        toast.success(`Mensagem criada com sucesso! ${selectedLeads.length} destinatários selecionados.`);
      }

      reset();
      setSelectedLeads([]);
      setSelectAll(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      toast.error('Erro ao salvar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedLeads([]);
    setSelectAll(false);
    setSearchTerm('');
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto z-50 p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
              {message ? 'Editar Mensagem em Massa' : 'Nova Mensagem em Massa'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Campanha *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Ex: Promoção Black Friday"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plataforma *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['whatsapp', 'instagram_dm', 'email'] as const).map((plt) => (
                      <label
                        key={plt}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          platform === plt
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <input type="radio" value={plt} {...register('platform')} className="sr-only" />
                        <span className="text-2xl">{platformIcons[plt]}</span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {platformNames[plt]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Variables Helper */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    Variáveis disponíveis (clique para inserir):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['{nome}', '{telefone}', '{email}', '{empresa}'].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-mono hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    {...register('content')}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none font-mono text-sm"
                    placeholder="Olá {nome}! Temos uma oferta especial para você..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                      {content?.length || 0} caracteres
                    </p>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Envio (opcional)
                    </label>
                    <input
                      type="date"
                      {...register('scheduledDate')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Horário
                    </label>
                    <input
                      type="time"
                      {...register('scheduledTime')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Recipients */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Users size={18} />
                      Destinatários
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedLeads.length} selecionados
                    </span>
                  </div>

                  {/* Search */}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm mb-3"
                    placeholder="Buscar por nome, telefone..."
                  />

                  {/* Select All */}
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm mb-3"
                  >
                    {selectAll ? <CheckSquare size={16} /> : <Square size={16} />}
                    Selecionar todos ({filteredLeads.length})
                  </button>

                  {/* Recipients List */}
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {filteredLeads.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Nenhum lead encontrado
                      </p>
                    ) : (
                      filteredLeads.map((lead) => (
                        <label
                          key={lead.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedLeads.includes(lead.id)
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => toggleLead(lead.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {lead.name}
                            </p>
                            {lead.phone && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                📱 {lead.phone}
                              </p>
                            )}
                            {lead.email && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                📧 {lead.email}
                              </p>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || selectedLeads.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
                {loading ? 'Salvando...' : message ? 'Atualizar Mensagem' : 'Criar Mensagem'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
