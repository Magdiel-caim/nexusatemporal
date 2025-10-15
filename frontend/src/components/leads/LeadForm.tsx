import { useState, FormEvent, useEffect } from 'react';
import { Lead, Stage, Procedure, leadsService } from '@/services/leadsService';
import { User, userService } from '@/services/userService';
import toast from 'react-hot-toast';

interface LeadFormProps {
  onSubmit: (data: Partial<Lead>) => Promise<void>;
  onCancel: () => void;
  initialData?: Lead;
  stages: Stage[];
}

export default function LeadForm({ onSubmit, onCancel, initialData, stages }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    phone2: initialData?.phone2 || '',
    whatsapp: initialData?.whatsapp || '',
    neighborhood: initialData?.neighborhood || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    stageId: initialData?.stageId || stages[0]?.id || '',
    procedureId: initialData?.procedureId || initialData?.procedure?.id || '',
    assignedToId: initialData?.assignedTo?.id || '',
    source: initialData?.source || 'website',
    channel: initialData?.channel || 'whatsapp',
    clientStatus: initialData?.clientStatus || 'conversa_iniciada',
    attendanceLocation: initialData?.attendanceLocation || 'moema',
    estimatedValue: initialData?.estimatedValue || '',
    notes: initialData?.notes || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  useEffect(() => {
    loadProcedures();
    loadUsers();
  }, []);

  const loadProcedures = async () => {
    try {
      const data = await leadsService.getProcedures();
      setProcedures(data);
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.stageId) {
      toast.error('Selecione um estágio');
      return;
    }

    setLoading(true);
    try {
      const submitData: Partial<Lead> = {
        ...formData,
        // Convert empty strings to null for UUID fields
        procedureId: formData.procedureId || undefined,
        assignedToId: formData.assignedToId || undefined,
        // Convert empty strings to null for optional text fields
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        phone2: formData.phone2 || undefined,
        whatsapp: formData.whatsapp || undefined,
        neighborhood: formData.neighborhood || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        // Parse numeric values
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue as any) : undefined,
        // Parse tags
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        // Convert empty strings to null for notes
        notes: formData.notes || undefined,
      };

      await onSubmit(submitData);
      toast.success(initialData ? 'Lead atualizado com sucesso' : 'Lead criado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Informações Básicas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Lead <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone 2</label>
            <input
              type="tel"
              value={formData.phone2}
              onChange={(e) => handleChange('phone2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Bairro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Cidade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estágio <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.stageId}
              onChange={(e) => handleChange('stageId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Procedimento</label>
            <select
              value={formData.procedureId}
              onChange={(e) => handleChange('procedureId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione um procedimento</option>
              {procedures.map(procedure => {
                const price = procedure.price ? Number(procedure.price) : null;
                return (
                  <option key={procedure.id} value={procedure.id}>
                    {procedure.name} {price ? `- R$ ${price.toFixed(2)}` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável <span className="text-xs text-gray-500">(Atendimento)</span>
            </label>
            <select
              value={formData.assignedToId}
              onChange={(e) => handleChange('assignedToId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione um responsável</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Detalhes da Venda */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Detalhes da Venda</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
            <select
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="website">Website</option>
              <option value="referral">Indicação</option>
              <option value="social_media">Redes Sociais</option>
              <option value="email">Email</option>
              <option value="phone">Telefone</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
            <select
              value={formData.channel}
              onChange={(e) => handleChange('channel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="site">Site</option>
              <option value="campanha">Campanha</option>
              <option value="bairro">Bairro</option>
              <option value="indicacao">Indicação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Situação do Cliente</label>
            <select
              value={formData.clientStatus}
              onChange={(e) => handleChange('clientStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="conversa_iniciada">Conversa Iniciada</option>
              <option value="cliente_potencial">Cliente Potencial</option>
              <option value="sem_potencial">Sem Potencial</option>
              <option value="contatar_futuro">Contatar no Futuro</option>
              <option value="sem_retorno">Sem Retorno</option>
              <option value="pre_qualificado">Pré Qualificado</option>
              <option value="qualificado">Qualificado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local de Atendimento</label>
            <select
              value={formData.attendanceLocation}
              onChange={(e) => handleChange('attendanceLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="moema">Moema</option>
              <option value="av_paulista">Av. Paulista</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Estimado</label>
            <input
              type="number"
              step="0.01"
              value={formData.estimatedValue}
              onChange={(e) => handleChange('estimatedValue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Informações Adicionais</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Separadas por vírgula: tag1, tag2, tag3"
            />
            <p className="text-xs text-gray-500 mt-1">Separe as tags com vírgulas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Adicione observações sobre este lead..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Salvando...' : initialData ? 'Atualizar Lead' : 'Criar Lead'}
        </button>
      </div>
    </form>
  );
}
