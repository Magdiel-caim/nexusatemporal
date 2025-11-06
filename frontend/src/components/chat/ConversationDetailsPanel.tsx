import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  UserPlus,
  Clock,
  Phone,
  Calendar,
  Hash,
  MessageSquare,
  Users,
  Zap,
  Archive,
  ArchiveRestore,
  AlertCircle,
  Plus,
  Trash2,
  Flag,
  Tag as TagIcon,
} from 'lucide-react';
import chatService, { Conversation } from '../../services/chatService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import TagSelector from './TagSelector';
import TagManager from './TagManager';
import UserAssignment from './UserAssignment';

interface ConversationDetailsPanelProps {
  conversation: Conversation;
  onClose?: () => void;
  onUpdate?: () => void;
}

interface AccordionSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
}

const ConversationDetailsPanel: React.FC<ConversationDetailsPanelProps> = ({
  conversation,
  onUpdate,
}) => {
  const [sections, setSections] = useState<AccordionSection[]>([
    { id: 'actions', title: 'Ações da conversa', icon: <Zap className="h-4 w-4" />, isOpen: true },
    { id: 'tags', title: 'Tags', icon: <TagIcon className="h-4 w-4" />, isOpen: false },
    { id: 'assignment', title: 'Atendente', icon: <UserPlus className="h-4 w-4" />, isOpen: false },
    { id: 'info', title: 'Informação da conversa', icon: <Hash className="h-4 w-4" />, isOpen: false },
    { id: 'attributes', title: 'Atributos do contato', icon: <UserPlus className="h-4 w-4" />, isOpen: false },
    { id: 'history', title: 'Conversas anteriores', icon: <Clock className="h-4 w-4" />, isOpen: false },
    { id: 'participants', title: 'Participantes da conversa', icon: <Users className="h-4 w-4" />, isOpen: false },
  ]);

  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | null>('medium');
  const [showTagManager, setShowTagManager] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participants, setParticipants] = useState<string[]>(conversation.participants || []);

  const customAttributes = conversation.metadata?.customAttributes || {};
  const priority = conversation.priority || 'medium';

  useEffect(() => {
    setSelectedPriority(priority);
  }, [priority]);

  useEffect(() => {
    const historySection = sections.find(s => s.id === 'history');
    if (historySection?.isOpen) {
      loadHistory();
      loadRecentConversations();
    }
  }, [sections]);

  useEffect(() => {
    setParticipants(conversation.participants || []);
  }, [conversation.participants]);

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await chatService.getConversationHistory(conversation.phoneNumber, 10);
      // Filtrar a conversa atual
      setConversationHistory(history.filter(c => c.id !== conversation.id));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadRecentConversations = async () => {
    try {
      setLoadingRecent(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api.nexusatemporal.com.br'}/api/chat/conversations/recent/${conversation.phoneNumber}?hours=6`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const recent = await response.json();
        setRecentConversations(recent.filter((c: Conversation) => c.id !== conversation.id));
      }
    } catch (error) {
      console.error('Erro ao carregar conversas recentes:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleAddParticipant = async (userId: string, userName: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api.nexusatemporal.com.br'}/api/chat/conversations/${conversation.id}/participants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ userId, userName }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setParticipants(updated.participants || []);
        toast.success(`${userName} adicionado como participante`);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
      toast.error('Erro ao adicionar participante');
    }
  };

  const handleRemoveParticipant = async (userId: string, userName: string) => {
    if (!confirm(`Remover ${userName} da conversa?`)) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://api.nexusatemporal.com.br'}/api/chat/conversations/${conversation.id}/participants`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ userId, userName }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setParticipants(updated.participants || []);
        toast.success(`${userName} removido da conversa`);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      toast.error('Erro ao remover participante');
    }
  };

  const handleArchive = async () => {
    try {
      await chatService.archiveConversation(conversation.id);
      toast.success('Conversa arquivada');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao arquivar conversa');
    }
  };

  const handleUnarchive = async () => {
    try {
      await chatService.unarchiveConversation(conversation.id);
      toast.success('Conversa desarquivada');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao desarquivar conversa');
    }
  };

  const handleResolve = async () => {
    try {
      await chatService.resolveConversation(conversation.id);
      toast.success('Conversa resolvida');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao resolver conversa');
    }
  };

  const handleReopen = async () => {
    try {
      await chatService.reopenConversation(conversation.id);
      toast.success('Conversa reaberta');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao reabrir conversa');
    }
  };

  const handlePriorityChange = async (newPriority: 'low' | 'medium' | 'high' | null) => {
    try {
      await chatService.setPriority(conversation.id, newPriority);
      setSelectedPriority(newPriority);
      toast.success('Prioridade atualizada');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao atualizar prioridade');
    }
  };

  const handleAddAttribute = async () => {
    if (!newAttributeKey.trim() || !newAttributeValue.trim()) {
      toast.error('Preencha o nome e valor do atributo');
      return;
    }

    try {
      await chatService.setCustomAttribute(conversation.id, newAttributeKey, newAttributeValue);
      setNewAttributeKey('');
      setNewAttributeValue('');
      toast.success('Atributo adicionado');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao adicionar atributo');
    }
  };

  const handleRemoveAttribute = async (key: string) => {
    try {
      await chatService.removeCustomAttribute(conversation.id, key);
      toast.success('Atributo removido');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao remover atributo');
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50';
      case 'medium': return 'text-orange-700 bg-orange-50';
      case 'low': return 'text-gray-700 bg-gray-50';
      case null: return 'text-gray-500 bg-gray-100';
      default: return 'text-blue-700 bg-blue-50';
    }
  };

  const getPriorityLabel = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      case null: return 'Sem prioridade';
      default: return 'Média';
    }
  };

  const renderActions = () => (
    <div className="space-y-3">
      {/* Prioridade */}
      <div className="px-3">
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Prioridade</label>
        <div className="grid grid-cols-2 gap-2">
          {['low', 'medium', 'high', null].map((p) => (
            <button
              key={p}
              onClick={() => handlePriorityChange(p as any)}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                selectedPriority === p
                  ? getPriorityColor(p)
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              <Flag className="h-3 w-3 inline mr-1" />
              {getPriorityLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Ações de Status */}
      <div className="space-y-2">
        {conversation.status === 'archived' ? (
          <button
            onClick={handleUnarchive}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
          >
            <ArchiveRestore className="h-4 w-4" />
            Desarquivar conversa
          </button>
        ) : (
          <button
            onClick={handleArchive}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded-lg transition-colors"
          >
            <Archive className="h-4 w-4" />
            Arquivar conversa
          </button>
        )}

        {conversation.status === 'closed' ? (
          <button
            onClick={handleReopen}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
          >
            <AlertCircle className="h-4 w-4" />
            Reabrir conversa
          </button>
        ) : (
          <button
            onClick={handleResolve}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Resolver conversa
          </button>
        )}
      </div>
    </div>
  );

  const renderInfo = () => (
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-2 px-3">
        <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Telefone</p>
          <p className="font-medium text-gray-700 dark:text-gray-300">{conversation.phoneNumber}</p>
        </div>
      </div>

      {conversation.whatsappInstanceId && (
        <div className="flex items-start gap-2 px-3">
          <Hash className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Sessão WhatsApp</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 break-all text-xs">{conversation.whatsappInstanceId}</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 px-3">
        <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            conversation.status === 'active' ? 'bg-green-100 text-green-700' :
            conversation.status === 'closed' ? 'bg-gray-100 text-gray-700' :
            conversation.status === 'archived' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {conversation.status === 'active' ? 'Ativa' :
             conversation.status === 'closed' ? 'Fechada' :
             conversation.status === 'archived' ? 'Arquivada' :
             conversation.status}
          </span>
        </div>
      </div>

      {conversation.createdAt && (
        <div className="flex items-start gap-2 px-3">
          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Criada em</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-xs">
              {format(new Date(conversation.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      )}

      {conversation.lastMessageAt && (
        <div className="flex items-start gap-2 px-3">
          <MessageSquare className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Última mensagem</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-xs">
              {format(new Date(conversation.lastMessageAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderAttributes = () => (
    <div className="space-y-3 text-sm">
      <div className="px-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Campos personalizados</p>

        {/* Lista de atributos existentes */}
        {Object.keys(customAttributes).length > 0 ? (
          <div className="space-y-2 mb-3">
            {Object.entries(customAttributes).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{key}</p>
                  <p className="text-gray-700 dark:text-gray-300 break-words">{String(value)}</p>
                </div>
                <button
                  onClick={() => handleRemoveAttribute(key)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                  title="Remover atributo"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Nenhum atributo adicionado</p>
        )}

        {/* Formulário para adicionar novo atributo */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nome do atributo"
            value={newAttributeKey}
            onChange={(e) => setNewAttributeKey(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Valor"
            value={newAttributeValue}
            onChange={(e) => setNewAttributeValue(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddAttribute}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus className="h-3 w-3" />
            Adicionar atributo
          </button>
        </div>
      </div>
    </div>
  );

  const renderTags = () => (
    <div className="px-3">
      <TagSelector
        conversationId={conversation.id}
        selectedTags={conversation.tags || []}
        onUpdate={onUpdate}
        onManageTags={() => setShowTagManager(true)}
      />
    </div>
  );

  const renderAssignment = () => (
    <div className="px-3">
      <UserAssignment
        conversationId={conversation.id}
        assignedUserId={conversation.assignedUserId}
        onUpdate={onUpdate}
      />
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-3 px-3">
      {/* Conversas Recentes (últimas 6 horas) */}
      <div>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Últimas 6 horas</p>
        {loadingRecent ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
        ) : recentConversations.length > 0 ? (
          <div className="space-y-2">
            {recentConversations.map((conv) => (
              <div key={conv.id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {format(new Date(conv.lastMessageAt || conv.createdAt), 'HH:mm', { locale: ptBR })}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    conv.status === 'closed' ? 'bg-gray-200 text-gray-700' :
                    conv.status === 'archived' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {conv.status === 'closed' ? 'Fechada' :
                     conv.status === 'archived' ? 'Arquivada' :
                     'Ativa'}
                  </span>
                </div>
                {conv.lastMessagePreview && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {conv.lastMessagePreview}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">Nenhuma conversa recente</p>
        )}
      </div>

      {/* Histórico Completo */}
      <div>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Histórico completo</p>
        {loadingHistory ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
        ) : conversationHistory.length > 0 ? (
          <div className="space-y-2">
            {conversationHistory.map((conv) => (
              <div key={conv.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    conv.status === 'closed' ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300' :
                    conv.status === 'archived' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {conv.status === 'closed' ? 'Fechada' :
                     conv.status === 'archived' ? 'Arquivada' :
                     'Ativa'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(conv.createdAt), 'dd/MM/yyyy')}
                  </span>
                </div>
                {conv.lastMessagePreview && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {conv.lastMessagePreview}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">Nenhuma conversa anterior</p>
        )}
      </div>
    </div>
  );

  const renderParticipants = () => (
    <div className="space-y-3 px-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">Pessoas envolvidas nesta conversa</p>

      {/* Cliente */}
      <div className="flex items-center gap-2 text-sm">
        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {conversation.contactName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-700 dark:text-gray-300">{conversation.contactName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cliente</p>
        </div>
      </div>

      {/* Atendente Principal */}
      {conversation.assignedUserId && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-green-700 dark:text-green-300" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-700 dark:text-gray-300">Atendente Principal</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {conversation.assignedUserId}</p>
          </div>
        </div>
      )}

      {/* Outros Participantes */}
      {participants && participants.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Outros Participantes</p>
          {participants.map((participantId) => (
            <div key={participantId} className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">ID: {participantId}</p>
              </div>
              <button
                onClick={() => handleRemoveParticipant(participantId, `Participante ${participantId}`)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                title="Remover participante"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botão Adicionar Participante */}
      <button
        onClick={() => setShowAddParticipant(!showAddParticipant)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors"
      >
        <Plus className="h-3 w-3" />
        Adicionar Participante
      </button>

      {/* Modal/Form Adicionar Participante (simplificado) */}
      {showAddParticipant && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Digite o ID do usuário para adicionar:
          </p>
          <input
            type="text"
            placeholder="ID do usuário"
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded mb-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const userId = (e.target as HTMLInputElement).value;
                if (userId) {
                  handleAddParticipant(userId, `Usuário ${userId}`);
                  (e.target as HTMLInputElement).value = '';
                  setShowAddParticipant(false);
                }
              }
            }}
          />
          <p className="text-xs text-gray-400">Pressione Enter para adicionar</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
              {conversation.contactName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{conversation.contactName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{conversation.phoneNumber}</p>
          </div>
        </div>

        {/* Tags */}
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {conversation.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 dark:border-gray-700">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="text-gray-600 dark:text-gray-400">{section.icon}</div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{section.title}</span>
              </div>
              {section.isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>

            {/* Section Content */}
            {section.isOpen && (
              <div className="pb-4">
                {section.id === 'actions' && renderActions()}
                {section.id === 'tags' && renderTags()}
                {section.id === 'assignment' && renderAssignment()}
                {section.id === 'info' && renderInfo()}
                {section.id === 'attributes' && renderAttributes()}
                {section.id === 'history' && renderHistory()}
                {section.id === 'participants' && renderParticipants()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tag Manager Modal */}
      {showTagManager && (
        <TagManager onClose={() => setShowTagManager(false)} />
      )}
    </div>
  );
};

export default ConversationDetailsPanel;
