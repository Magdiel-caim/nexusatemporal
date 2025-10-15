import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  UserPlus,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  MessageSquare,
  Users,
  Zap,
} from 'lucide-react';
import { Conversation } from '../../services/chatService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationDetailsPanelProps {
  conversation: Conversation;
  onClose?: () => void;
}

interface AccordionSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
}

const ConversationDetailsPanel: React.FC<ConversationDetailsPanelProps> = ({
  conversation,
}) => {
  const [sections, setSections] = useState<AccordionSection[]>([
    { id: 'actions', title: 'Ações da conversa', icon: <Zap className="h-4 w-4" />, isOpen: true },
    { id: 'macros', title: 'Macros', icon: <MessageSquare className="h-4 w-4" />, isOpen: false },
    { id: 'info', title: 'Informação da conversa', icon: <Hash className="h-4 w-4" />, isOpen: false },
    { id: 'attributes', title: 'Atributos do contato', icon: <UserPlus className="h-4 w-4" />, isOpen: false },
    { id: 'history', title: 'Conversas anteriores', icon: <Clock className="h-4 w-4" />, isOpen: false },
    { id: 'participants', title: 'Participantes da conversa', icon: <Users className="h-4 w-4" />, isOpen: false },
  ]);

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const renderActions = () => (
    <div className="space-y-2">
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors">
        <CheckCircle className="h-4 w-4" />
        Resolver conversa
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors">
        <XCircle className="h-4 w-4" />
        Fechar conversa
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
        <UserPlus className="h-4 w-4" />
        Atribuir a usuário
      </button>
    </div>
  );

  const renderMacros = () => (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 px-3">Respostas rápidas disponíveis</p>
      <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-lg">
        Saudação inicial
      </button>
      <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-lg">
        Horário de atendimento
      </button>
      <button className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded-lg">
        Informações sobre serviços
      </button>
    </div>
  );

  const renderInfo = () => (
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-2 px-3">
        <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-gray-500">Telefone</p>
          <p className="font-medium text-gray-700">{conversation.phoneNumber}</p>
        </div>
      </div>

      {conversation.whatsappInstanceId && (
        <div className="flex items-start gap-2 px-3">
          <Hash className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Sessão WhatsApp</p>
            <p className="font-medium text-gray-700 break-all">{conversation.whatsappInstanceId}</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 px-3">
        <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-gray-500">Status</p>
          <p className="font-medium text-gray-700 capitalize">{conversation.status}</p>
        </div>
      </div>

      {conversation.createdAt && (
        <div className="flex items-start gap-2 px-3">
          <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Criada em</p>
            <p className="font-medium text-gray-700">
              {format(new Date(conversation.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      )}

      {conversation.lastMessageAt && (
        <div className="flex items-start gap-2 px-3">
          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Última mensagem</p>
            <p className="font-medium text-gray-700">
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
        <p className="text-xs text-gray-500 mb-2">Campos personalizados</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-gray-700">Não informado</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Cidade</p>
              <p className="text-gray-700">Não informado</p>
            </div>
          </div>
        </div>
      </div>
      <button className="w-full px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
        + Adicionar atributo
      </button>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-2 px-3">
      <p className="text-xs text-gray-500">Histórico de conversas anteriores</p>
      <div className="text-sm text-gray-600">
        <p>Nenhuma conversa anterior encontrada</p>
      </div>
    </div>
  );

  const renderParticipants = () => (
    <div className="space-y-2 px-3">
      <div className="flex items-center gap-2 text-sm">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-indigo-700">
            {conversation.contactName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-700">{conversation.contactName}</p>
          <p className="text-xs text-gray-500">Cliente</p>
        </div>
      </div>
      {conversation.assignedUserId && (
        <div className="flex items-center gap-2 text-sm mt-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-green-700" />
          </div>
          <div>
            <p className="font-medium text-gray-700">Atendente</p>
            <p className="text-xs text-gray-500">ID: {conversation.assignedUserId}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-indigo-700">
              {conversation.contactName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{conversation.contactName}</h3>
            <p className="text-xs text-gray-500">{conversation.phoneNumber}</p>
          </div>
        </div>

        {/* Tags */}
        {conversation.tags && conversation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {conversation.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
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
          <div key={section.id} className="border-b border-gray-200">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="text-gray-600">{section.icon}</div>
                <span className="text-sm font-medium text-gray-700">{section.title}</span>
              </div>
              {section.isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {/* Section Content */}
            {section.isOpen && (
              <div className="pb-4">
                {section.id === 'actions' && renderActions()}
                {section.id === 'macros' && renderMacros()}
                {section.id === 'info' && renderInfo()}
                {section.id === 'attributes' && renderAttributes()}
                {section.id === 'history' && renderHistory()}
                {section.id === 'participants' && renderParticipants()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationDetailsPanel;
