import { MessageCircle, AlertCircle, Phone, ExternalLink, Clock, CheckCheck, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Patient } from '../../services/pacienteService';
import pacienteService from '../../services/pacienteService';
import toast from 'react-hot-toast';

interface ChatTabProps {
  patient: Patient;
}

interface Conversation {
  id: string;
  contactName: string;
  phoneNumber: string;
  status: string;
  isUnread: boolean;
  unreadCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  messages?: Message[];
}

interface Message {
  id: string;
  content: string;
  direction: string;
  status: string;
  timestamp: string;
}

export default function ChatTab({ patient }: ChatTabProps) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patient.whatsapp) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [patient.id]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await pacienteService.getConversations(patient.id);
      setConversations(data);
    } catch (error: any) {
      console.error('Erro ao carregar conversas:', error);
      if (error.response?.status !== 404) {
        toast.error('Erro ao carregar conversas');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone?: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Ativa',
      archived: 'Arquivada',
      closed: 'Fechada',
      waiting: 'Aguardando',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      closed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const handleOpenWhatsApp = () => {
    if (!patient.whatsapp) {
      alert('Paciente não possui WhatsApp cadastrado');
      return;
    }

    navigate('/chat', {
      state: {
        openContact: patient.whatsapp.replace(/\D/g, ''),
        contactName: patient.name,
        patientId: patient.id,
      },
    });
  };

  const handleOpenWhatsAppDirect = () => {
    if (!patient.whatsapp) {
      alert('Paciente não possui WhatsApp cadastrado');
      return;
    }

    const phoneNumber = patient.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${phoneNumber}`;
    window.open(url, '_blank');
  };

  const handleOpenConversation = (conversation: Conversation) => {
    navigate('/chat', {
      state: {
        openContact: conversation.phoneNumber,
        contactName: conversation.contactName,
        conversationId: conversation.id,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chat / WhatsApp
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Histórico de conversas e comunicação com o paciente
        </p>
      </div>

      {/* WhatsApp Info Card */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
              Contato do Paciente
            </h4>

            {patient.whatsapp ? (
              <>
                <p className="text-green-800 dark:text-green-300 mb-4">
                  WhatsApp: <span className="font-semibold">{formatPhone(patient.whatsapp)}</span>
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir no Chat Interno
                  </button>

                  <button
                    onClick={handleOpenWhatsAppDirect}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir no WhatsApp
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-2 text-orange-800 dark:text-orange-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  Paciente não possui WhatsApp cadastrado. Edite os dados do paciente para adicionar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Conversations List */}
      {!loading && conversations.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Histórico de Conversas ({conversations.length})
          </h4>

          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenConversation(conversation)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {conversation.contactName}
                        </h5>
                        {conversation.isUnread && conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatPhone(conversation.phoneNumber)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        conversation.status
                      )}`}
                    >
                      {getStatusLabel(conversation.status)}
                    </span>
                    {conversation.lastMessageAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(conversation.lastMessageAt)}
                      </div>
                    )}
                  </div>
                </div>

                {conversation.lastMessagePreview && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2">
                      <CheckCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {conversation.lastMessagePreview}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleOpenWhatsApp}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver todas as conversas no Chat →
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && conversations.length === 0 && patient.whatsapp && (
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Integração com Módulo de Chat
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  Esta seção exibe automaticamente o histórico de conversas do paciente. Funcionalidades:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-4 list-disc">
                  <li>Ver histórico completo de mensagens</li>
                  <li>Iniciar nova conversa pelo chat interno</li>
                  <li>Abrir conversa diretamente no WhatsApp Web/App</li>
                  <li>Status das conversas (ativa, aguardando, fechada)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Nenhuma conversa encontrada
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              O histórico de mensagens aparecerá aqui automaticamente
            </p>
            <button
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Iniciar Conversa
            </button>
          </div>
        </div>
      )}

      {/* No WhatsApp */}
      {!loading && !patient.whatsapp && (
        <div className="text-center py-12">
          <Phone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            WhatsApp não cadastrado
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Adicione um número de WhatsApp para ver o histórico de conversas
          </p>
          <button
            onClick={() => navigate(`/pacientes/${patient.id}/editar`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar Paciente
          </button>
        </div>
      )}
    </div>
  );
}
