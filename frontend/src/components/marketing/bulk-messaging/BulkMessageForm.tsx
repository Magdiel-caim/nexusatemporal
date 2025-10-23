import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Send, Users, CheckSquare, Square, Sparkles, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { BulkMessage } from '@/services/marketingService';
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

interface WahaSession {
  id: string;
  name: string;
  displayName: string;
  phoneNumber?: string;
  status: string;
  isPrimary?: boolean;
}

interface Contact {
  name: string;
  phone: string;
  isValid?: boolean;
  error?: string;
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

  // WAHA Sessions
  const [wahaSessions, setWahaSessions] = useState<WahaSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [loadingSessions, setLoadingSessions] = useState(false);

  // CSV Upload
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCSV, setUploadingCSV] = useState(false);

  // AI Generation
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);

  // Image Upload
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Randomization
  const [minDelay, setMinDelay] = useState(1);
  const [maxDelay, setMaxDelay] = useState(5);

  // Send Mode
  const [sendMode, setSendMode] = useState<'immediate' | 'scheduled'>('immediate');

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
      fetchWahaSessions();
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

  // Fetch WAHA Sessions
  const fetchWahaSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch('/api/marketing/waha/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Filtrar apenas sessões conectadas
        const activeSessions = data.data.filter((s: WahaSession) => s.status === 'working');
        setWahaSessions(activeSessions);

        // Selecionar sessão primária automaticamente
        const primarySession = activeSessions.find((s: WahaSession) => s.isPrimary);
        if (primarySession) {
          setSelectedSessionId(primarySession.id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar sessões WAHA:', error);
      toast.error('Erro ao carregar sessões WhatsApp');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Validação de telefone brasileiro
  const validateBRPhone = (phone: string): { isValid: boolean; cleaned: string; error?: string } => {
    // Remove tudo exceto números
    const cleaned = phone.replace(/\D/g, '');

    // Verifica se tem +55
    if (!cleaned.startsWith('55')) {
      return { isValid: false, cleaned, error: 'Falta código do país (+55)' };
    }

    // Remove o 55
    const withoutCountry = cleaned.substring(2);

    // Verifica DDD (2 dígitos)
    if (withoutCountry.length < 2) {
      return { isValid: false, cleaned, error: 'DDD incompleto' };
    }

    const ddd = withoutCountry.substring(0, 2);
    const number = withoutCountry.substring(2);

    // Verifica se número tem 8 ou 9 dígitos
    if (number.length === 9 && number[0] === '9') {
      // Celular com 9 dígitos (padrão atual)
      return { isValid: true, cleaned: `+55${ddd}${number}` };
    } else if (number.length === 8) {
      // Fixo com 8 dígitos
      return { isValid: true, cleaned: `+55${ddd}${number}` };
    } else {
      return { isValid: false, cleaned, error: 'Número deve ter 8 ou 9 dígitos' };
    }
  };

  // Parse CSV
  const handleCSVUpload = (file: File) => {
    setUploadingCSV(true);
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedContacts: Contact[] = results.data.map((row: any) => {
          const name = row.nome || row.name || row.Name || row.NOME || '';
          const phone = row.telefone || row.phone || row.Phone || row.TELEFONE || row.whatsapp || '';

          const validation = validateBRPhone(phone);

          return {
            name: name.trim(),
            phone: validation.cleaned,
            isValid: validation.isValid,
            error: validation.error
          };
        });

        // Filtrar apenas válidos
        const validContacts = parsedContacts.filter(c => c.isValid && c.name);
        setContacts(validContacts);

        toast.success(`${validContacts.length} contatos importados com sucesso!`);

        // Avisar sobre inválidos
        const invalidCount = parsedContacts.length - validContacts.length;
        if (invalidCount > 0) {
          toast.error(`${invalidCount} contatos foram ignorados (inválidos)`);
        }

        setUploadingCSV(false);
      },
      error: (error) => {
        console.error('Erro ao processar CSV:', error);
        toast.error('Erro ao processar arquivo CSV');
        setUploadingCSV(false);
      }
    });
  };

  // Upload de imagem
  const handleImageUpload = async (file: File) => {
    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo deve ser uma imagem');
      return;
    }

    setImagePreviewUrl(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/marketing/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.url);
        toast.success('Imagem enviada com sucesso!');
      } else {
        toast.error('Erro ao enviar imagem');
        setImagePreviewUrl('');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar imagem');
      setImagePreviewUrl('');
    } finally {
      setUploadingImage(false);
    }
  };

  // Geração com IA
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Digite uma instrução para a IA');
      return;
    }

    setAiGenerating(true);

    try {
      const response = await fetch('/api/marketing/ai-assistant/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: {
            platform: 'whatsapp',
            audience: 'leads',
            goal: 'engagement'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        // Atualizar o campo de conteúdo usando react-hook-form
        const contentField = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
        if (contentField) {
          contentField.value = data.output.generatedText;
          contentField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setShowAIModal(false);
        setAiPrompt('');
        toast.success('Mensagem gerada com sucesso!');
      } else {
        toast.error(data.message || 'Erro ao gerar mensagem');
      }
    } catch (error) {
      console.error('Erro ao gerar com IA:', error);
      toast.error('Erro ao comunicar com a IA');
    } finally {
      setAiGenerating(false);
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
    // Validações
    if (!selectedSessionId && platform === 'whatsapp') {
      toast.error('Selecione uma sessão WhatsApp');
      return;
    }

    if (contacts.length === 0 && selectedLeads.length === 0) {
      toast.error('Importe uma lista de contatos ou selecione leads');
      return;
    }

    if (!content.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    if (sendMode === 'scheduled' && (!data.scheduledDate || !data.scheduledTime)) {
      toast.error('Selecione data e hora do agendamento');
      return;
    }

    try {
      setLoading(true);

      let scheduledFor: string | undefined;
      if (sendMode === 'scheduled' && data.scheduledDate && data.scheduledTime) {
        scheduledFor = new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString();
      }

      // Usar contatos do CSV se disponível, caso contrário usar leads selecionados
      const recipientsList = contacts.length > 0
        ? contacts
        : selectedLeads.map(leadId => {
            const lead = leads.find(l => l.id === leadId);
            return {
              name: lead?.name || '',
              phone: lead?.phone || ''
            };
          });

      const response = await fetch('/api/marketing/bulk-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          contacts: recipientsList,
          message: content,
          imageUrl: imageUrl || null,
          minDelaySeconds: minDelay,
          maxDelaySeconds: maxDelay,
          scheduledFor: scheduledFor || null
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          sendMode === 'immediate'
            ? `Disparo iniciado! ${recipientsList.length} mensagens na fila`
            : `Disparo agendado para ${new Date(scheduledFor!).toLocaleString()}`
        );

        // Resetar form
        reset();
        setContacts([]);
        setSelectedLeads([]);
        setSelectAll(false);
        setImagePreviewUrl('');
        setImageUrl('');
        setCsvFile(null);
        setSearchTerm('');
        setSendMode('immediate');

        onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Erro ao criar disparo');
      }
    } catch (error) {
      console.error('Erro ao criar disparo:', error);
      toast.error('Erro ao comunicar com o servidor');
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

                {/* WAHA Session Selection (only for WhatsApp) */}
                {platform === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sessão WhatsApp *
                    </label>

                    {loadingSessions ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        Carregando sessões...
                      </div>
                    ) : wahaSessions.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Nenhuma sessão WhatsApp conectada.
                        </p>
                        <a
                          href="/integracoes-sociais"
                          className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Configurar sessões WhatsApp →
                        </a>
                      </div>
                    ) : (
                      <select
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Selecione uma sessão</option>
                        {wahaSessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.displayName} {session.phoneNumber ? `(${session.phoneNumber})` : ''}
                            {session.status === 'working' ? ' ✓' : ''}
                          </option>
                        ))}
                      </select>
                    )}

                    {selectedSessionId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Os disparos serão enviados através desta sessão WhatsApp
                      </p>
                    )}
                  </div>
                )}

                {/* CSV Upload (only for WhatsApp) */}
                {platform === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Importar Lista de Contatos (CSV)
                    </label>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleCSVUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="csv-upload"
                        disabled={uploadingCSV}
                      />

                      <label
                        htmlFor="csv-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        <Upload size={18} />
                        Selecionar Arquivo CSV
                      </label>

                      {uploadingCSV && (
                        <div className="mt-2 text-sm text-gray-500">
                          Processando arquivo...
                        </div>
                      )}

                      {csvFile && !uploadingCSV && (
                        <div className="mt-2 text-sm text-gray-600">
                          Arquivo: {csvFile.name}
                        </div>
                      )}
                    </div>

                    {/* Preview dos contatos */}
                    {contacts.length > 0 && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-800">
                            ✓ {contacts.length} contatos prontos para envio
                          </h4>
                          <button
                            type="button"
                            onClick={() => setContacts([])}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Limpar lista
                          </button>
                        </div>

                        <div className="max-h-40 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-green-100">
                              <tr>
                                <th className="text-left p-2">Nome</th>
                                <th className="text-left p-2">Telefone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {contacts.slice(0, 10).map((contact, index) => (
                                <tr key={index} className="border-t border-green-200">
                                  <td className="p-2">{contact.name}</td>
                                  <td className="p-2">{contact.phone}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {contacts.length > 10 && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              ... e mais {contacts.length - 10} contatos
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Instruções */}
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-medium mb-1">Formato do CSV:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Colunas: <code className="bg-gray-100 px-1">nome,telefone</code></li>
                        <li>Telefone: formato +5511999999999 ou 11999999999</li>
                        <li>Aceita 8 ou 9 dígitos (fixo ou celular)</li>
                      </ul>
                      <a
                        href="/exemplo-contatos.csv"
                        download
                        className="text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Baixar arquivo de exemplo →
                      </a>
                    </div>
                  </div>
                )}

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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mensagem *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAIModal(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
                    >
                      <Sparkles size={14} />
                      Usar IA
                    </button>
                  </div>
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

                {/* Image Upload (only for WhatsApp) */}
                {platform === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Imagem (Opcional)
                    </label>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      {!imagePreviewUrl ? (
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                            id="image-upload"
                            disabled={uploadingImage}
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          >
                            <ImageIcon size={18} />
                            Adicionar Imagem
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG ou GIF • Máx. 5MB
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          )}
                          {!uploadingImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreviewUrl('');
                                setImageUrl('');
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Randomization Controls (only for WhatsApp) */}
                {platform === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Intervalo entre Mensagens
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Mínimo (segundos)</label>
                        <input
                          type="number"
                          value={minDelay}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMinDelay(Math.max(1, Math.min(val, maxDelay - 1)));
                          }}
                          min={1}
                          max={60}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Máximo (segundos)</label>
                        <input
                          type="number"
                          value={maxDelay}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMaxDelay(Math.max(minDelay + 1, Math.min(val, 60)));
                          }}
                          min={1}
                          max={60}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        ⏱️ Tempo aleatório entre <strong>{minDelay}s</strong> e <strong>{maxDelay}s</strong> entre cada mensagem
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Tempo estimado total: {Math.ceil(((contacts.length || selectedLeads.length) * (minDelay + maxDelay) / 2) / 60)} minutos
                      </p>
                    </div>
                  </div>
                )}

                {/* Send Mode */}
                {platform === 'whatsapp' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quando Enviar?
                    </label>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="sendMode"
                          value="immediate"
                          checked={sendMode === 'immediate'}
                          onChange={() => setSendMode('immediate')}
                          className="w-4 h-4 text-blue-500"
                        />
                        <div>
                          <div className="font-medium">Enviar Imediatamente</div>
                          <div className="text-xs text-gray-500">Os disparos começarão assim que você clicar em "Enviar"</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="sendMode"
                          value="scheduled"
                          checked={sendMode === 'scheduled'}
                          onChange={() => setSendMode('scheduled')}
                          className="w-4 h-4 text-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Agendar Envio</div>
                          <div className="text-xs text-gray-500 mb-2">Escolha data e hora para iniciar os disparos</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Scheduling (show only if scheduled mode or not WhatsApp) */}
                {(sendMode === 'scheduled' || platform !== 'whatsapp') && (
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
                )}
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
                disabled={loading || (selectedLeads.length === 0 && contacts.length === 0)}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
                {loading ? 'Salvando...' : message ? 'Atualizar Mensagem' : 'Criar Mensagem'}
              </button>
            </div>
          </form>

          {/* AI Modal */}
          {showAIModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-500" />
                    Gerar Mensagem com IA
                  </h3>
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white mb-4"
                  placeholder="Ex: Criar mensagem de vendas para curso online de marketing, tom amigável e profissional, incluir call-to-action"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    disabled={aiGenerating}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerateWithAI}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                    disabled={aiGenerating}
                  >
                    {aiGenerating ? 'Gerando...' : 'Gerar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
