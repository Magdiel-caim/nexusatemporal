import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/services/leadsService';
import { User, Phone, MapPin, MessageCircle, Mail } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface DraggableLeadCardProps {
  lead: Lead;
  formatCurrency: (value?: number) => string;
  onClick: () => void;
}

const getChannelIcon = (channel?: string) => {
  switch (channel) {
    case 'whatsapp':
      return <MessageCircle className="w-3.5 h-3.5" />;
    case 'phone':
      return <Phone className="w-3.5 h-3.5" />;
    case 'email':
      return <Mail className="w-3.5 h-3.5" />;
    default:
      return <MessageCircle className="w-3.5 h-3.5" />;
  }
};

const getChannelLabel = (channel?: string) => {
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    phone: 'Telefone',
    email: 'E-mail',
    instagram: 'Instagram',
    facebook: 'Facebook',
    website: 'Site',
    in_person: 'Presencial',
    other: 'Outro',
  };
  return labels[channel || 'whatsapp'] || 'WhatsApp';
};

const getClientStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    conversa_iniciada: 'Conversa Iniciada',
    agendamento_pendente: 'Aguardando Agendamento',
    agendado: 'Agendado',
    em_tratamento: 'Em Tratamento',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  };
  return labels[status || 'conversa_iniciada'] || 'Conversa Iniciada';
};

const getLocationLabel = (location?: string) => {
  const labels: Record<string, string> = {
    moema: 'Moema',
    perdizes: 'Perdizes',
    online: 'Online',
    a_domicilio: 'Domicílio',
  };
  return labels[location || 'moema'] || 'Moema';
};

const getUserInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function DraggableLeadCard({ lead, formatCurrency, onClick }: DraggableLeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // Ref para detectar se houve drag
  const dragDetected = useRef(false);

  // Detectar quando há movimento significativo durante o drag
  useEffect(() => {
    if (transform && (Math.abs(transform.x) > 5 || Math.abs(transform.y) > 5)) {
      dragDetected.current = true;
    }
  }, [transform]);

  // Limpar o flag quando não está mais dragging
  useEffect(() => {
    if (!isDragging && dragDetected.current) {
      // Aguardar um pouco antes de limpar para garantir que o onClick seja bloqueado
      const timer = setTimeout(() => {
        dragDetected.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  // Detectar se houve drag para prevenir onClick acidental
  const handleClick = (e: React.MouseEvent) => {
    // Se houve drag, não executar onClick
    if (dragDetected.current) {
      return;
    }

    // Se não está arrastando, executar onClick
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border border-gray-200"
    >
      {/* Header: Nome + Responsável */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm flex-1 pr-2 line-clamp-2">
          {lead.name}
        </h4>
        {lead.assignedTo && (
          <div
            className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold"
            title={`Responsável: ${lead.assignedTo.name}`}
          >
            {getUserInitials(lead.assignedTo.name)}
          </div>
        )}
      </div>

      {/* Procedimento */}
      {lead.procedure && (
        <div className="mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded font-medium inline-block"
            style={{
              backgroundColor: lead.procedure.color + '20',
              color: lead.procedure.color
            }}
          >
            {lead.procedure.name}
          </span>
        </div>
      )}

      {/* Valor Estimado */}
      {lead.estimatedValue && (
        <p className="text-sm font-bold text-primary-600 mb-2">
          {formatCurrency(lead.estimatedValue)}
        </p>
      )}

      {/* Informações Adicionais */}
      <div className="space-y-1.5 mb-2">
        {/* Canal */}
        {lead.channel && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            {getChannelIcon(lead.channel)}
            <span>{getChannelLabel(lead.channel)}</span>
          </div>
        )}

        {/* Situação do Cliente */}
        {lead.clientStatus && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <User className="w-3.5 h-3.5" />
            <span>{getClientStatusLabel(lead.clientStatus)}</span>
          </div>
        )}

        {/* Local de Atendimento */}
        {lead.attendanceLocation && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5" />
            <span>{getLocationLabel(lead.attendanceLocation)}</span>
          </div>
        )}
      </div>

      {/* Contatos (Email e Telefone - apenas ícones) */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {lead.email && (
          <Mail className="w-3.5 h-3.5" title={lead.email} />
        )}
        {lead.phone && (
          <Phone className="w-3.5 h-3.5" title={lead.phone} />
        )}
        {lead.whatsapp && (
          <MessageCircle className="w-3.5 h-3.5" title={lead.whatsapp} />
        )}
      </div>

      {/* Tags */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
            >
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
              +{lead.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
