import { Calendar, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AgendamentosTabProps {
  patientId: string;
}

export default function AgendamentosTab({ patientId }: AgendamentosTabProps) {
  const navigate = useNavigate();

  // TODO: Integrar com o módulo de agendamentos
  // const [appointments, setAppointments] = useState([]);

  const handleNewAppointment = () => {
    // Navegar para módulo de agenda com o paciente pré-selecionado
    navigate('/agenda', {
      state: {
        patientId: patientId,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agendamentos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Histórico de agendamentos do paciente
          </p>
        </div>

        <button
          onClick={handleNewAppointment}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Integração com Módulo de Agenda
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              Esta seção exibirá os agendamentos do paciente vindos do módulo de Agenda.
              Para ver ou criar agendamentos, você pode:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-4 list-disc">
              <li>Clicar no botão "Novo Agendamento" acima</li>
              <li>Acessar o módulo de Agenda diretamente no menu</li>
              <li>Filtrar agendamentos por este paciente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Nenhum agendamento encontrado
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Os agendamentos aparecerão aqui quando criados no módulo de Agenda
        </p>
      </div>

      {/* Future: Lista de agendamentos */}
      {/*
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            // Conteúdo do card de agendamento
          </div>
        ))}
      </div>
      */}
    </div>
  );
}
