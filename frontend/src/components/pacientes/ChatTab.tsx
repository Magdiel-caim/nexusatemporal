import { MessageCircle, Send, AlertCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../services/pacienteService';

interface ChatTabProps {
  patient: Patient;
}

export default function ChatTab({ patient }: ChatTabProps) {
  const navigate = useNavigate();

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

  const handleOpenWhatsApp = () => {
    if (!patient.whatsapp) {
      alert('Paciente não possui WhatsApp cadastrado');
      return;
    }

    // Navegar para módulo de chat com o paciente pré-selecionado
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

    // Abrir WhatsApp Web/App diretamente
    const phoneNumber = patient.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${phoneNumber}`;
    window.open(url, '_blank');
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
                    <Send className="w-4 h-4" />
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

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Integração com Módulo de Chat
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              Esta seção exibirá o histórico de conversas do paciente vindas do módulo de Chat/WhatsApp.
              Funcionalidades disponíveis:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-4 list-disc">
              <li>Ver histórico completo de mensagens</li>
              <li>Iniciar nova conversa pelo chat interno</li>
              <li>Abrir conversa diretamente no WhatsApp Web/App</li>
              <li>Enviar mensagens rápidas</li>
              <li>Ver status das conversas (aberta, fechada, aguardando)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Histórico de conversas
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          O histórico de mensagens aparecerá aqui quando houver conversas registradas
        </p>
      </div>

      {/* Future: Histórico de mensagens */}
      {/*
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            // Conteúdo da mensagem
          </div>
        ))}
      </div>
      */}

      {/* Future: Quick message form */}
      {/*
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <form className="flex gap-3">
          <input
            type="text"
            placeholder="Digite uma mensagem rápida..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
      */}
    </div>
  );
}
