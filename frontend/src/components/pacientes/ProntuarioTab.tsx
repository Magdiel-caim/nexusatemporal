import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';
import pacienteService, { PatientMedicalRecord } from '../../services/pacienteService';

interface ProntuarioTabProps {
  patientId: string;
}

export default function ProntuarioTab({ patientId }: ProntuarioTabProps) {
  const [records, setRecords] = useState<PatientMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    historyOfPresentIllness: '',
    physicalExamination: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    observations: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
    },
  });

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await pacienteService.getMedicalRecords(patientId);
      setRecords(data);
    } catch (error) {
      console.error('Erro ao carregar prontuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVitalSignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [name]: value,
      },
    }));
  };

  const resetForm = () => {
    setFormData({
      serviceDate: new Date().toISOString().split('T')[0],
      chiefComplaint: '',
      historyOfPresentIllness: '',
      physicalExamination: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      observations: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chiefComplaint.trim()) {
      alert('A queixa principal é obrigatória');
      return;
    }

    setSaving(true);

    try {
      const dataToSend = {
        serviceDate: new Date(formData.serviceDate).toISOString(),
        chiefComplaint: formData.chiefComplaint,
        historyOfPresentIllness: formData.historyOfPresentIllness || undefined,
        physicalExamination: formData.physicalExamination || undefined,
        diagnosis: formData.diagnosis || undefined,
        treatment: formData.treatment || undefined,
        prescription: formData.prescription || undefined,
        observations: formData.observations || undefined,
        vitalSigns: Object.keys(formData.vitalSigns).some(
          key => formData.vitalSigns[key as keyof typeof formData.vitalSigns]
        )
          ? {
              bloodPressure: formData.vitalSigns.bloodPressure || undefined,
              heartRate: formData.vitalSigns.heartRate ? parseFloat(formData.vitalSigns.heartRate) : undefined,
              temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined,
              weight: formData.vitalSigns.weight ? parseFloat(formData.vitalSigns.weight) : undefined,
              height: formData.vitalSigns.height ? parseFloat(formData.vitalSigns.height) : undefined,
            }
          : undefined,
      };

      await pacienteService.createMedicalRecord(patientId, dataToSend);
      await loadRecords();
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar prontuário:', error);
      alert(error.response?.data?.message || 'Erro ao salvar prontuário');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleRecord = (recordId: string) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando prontuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Prontuários Médicos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {records.length} {records.length === 1 ? 'registro' : 'registros'}
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Novo Prontuário'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Novo Registro de Atendimento
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2">
              Data do Atendimento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Queixa Principal <span className="text-red-500">*</span>
            </label>
            <textarea
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="Descreva a queixa principal do paciente"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              História da Doença Atual
            </label>
            <textarea
              name="historyOfPresentIllness"
              value={formData.historyOfPresentIllness}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="Descreva a história da doença"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exame Físico</label>
            <textarea
              name="physicalExamination"
              value={formData.physicalExamination}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="Descreva o exame físico realizado"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Pressão Arterial</label>
              <input
                type="text"
                name="bloodPressure"
                value={formData.vitalSigns.bloodPressure}
                onChange={handleVitalSignChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                placeholder="120/80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Freq. Cardíaca</label>
              <input
                type="text"
                name="heartRate"
                value={formData.vitalSigns.heartRate}
                onChange={handleVitalSignChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                placeholder="bpm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Temperatura</label>
              <input
                type="text"
                name="temperature"
                value={formData.vitalSigns.temperature}
                onChange={handleVitalSignChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                placeholder="°C"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Peso</label>
              <input
                type="text"
                name="weight"
                value={formData.vitalSigns.weight}
                onChange={handleVitalSignChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                placeholder="kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Altura</label>
              <input
                type="text"
                name="height"
                value={formData.vitalSigns.height}
                onChange={handleVitalSignChange}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                placeholder="cm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Diagnóstico</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="Descreva o diagnóstico"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tratamento</label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="Descreva o tratamento proposto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prescrição</label>
            <textarea
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="Medicamentos e orientações"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="Observações adicionais"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Prontuário'}
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Nenhum prontuário cadastrado</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Clique em "Novo Prontuário" para criar o primeiro registro
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Record Header */}
              <div
                onClick={() => toggleRecord(record.id)}
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(record.serviceDate)}
                      </span>
                      {record.revisionNumber > 1 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (Revisão {record.revisionNumber})
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      <span className="font-medium">Queixa:</span> {record.chiefComplaint}
                    </p>

                    {record.diagnosis && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-1">
                        <span className="font-medium">Diagnóstico:</span> {record.diagnosis}
                      </p>
                    )}
                  </div>

                  <button className="ml-4 p-1">
                    {expandedRecord === record.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Record Details */}
              {expandedRecord === record.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                  {record.historyOfPresentIllness && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                        História da Doença Atual
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                        {record.historyOfPresentIllness}
                      </p>
                    </div>
                  )}

                  {record.physicalExamination && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Exame Físico
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                        {record.physicalExamination}
                      </p>
                    </div>
                  )}

                  {record.vitalSigns && Object.keys(record.vitalSigns).length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Sinais Vitais
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {record.vitalSigns.bloodPressure && (
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">PA:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {record.vitalSigns.bloodPressure}
                            </span>
                          </div>
                        )}
                        {record.vitalSigns.heartRate && (
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">FC:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {record.vitalSigns.heartRate} bpm
                            </span>
                          </div>
                        )}
                        {record.vitalSigns.temperature && (
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Temp:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {record.vitalSigns.temperature}°C
                            </span>
                          </div>
                        )}
                        {record.vitalSigns.weight && (
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Peso:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {record.vitalSigns.weight} kg
                            </span>
                          </div>
                        )}
                        {record.vitalSigns.height && (
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Altura:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {record.vitalSigns.height} cm
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {record.treatment && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Tratamento
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                        {record.treatment}
                      </p>
                    </div>
                  )}

                  {record.prescription && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Prescrição
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                        {record.prescription}
                      </p>
                    </div>
                  )}

                  {record.observations && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Observações
                      </h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                        {record.observations}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cadastrado em: {formatDateTime(record.createdAt)}
                      {record.revisedAt && ` | Última revisão: ${formatDateTime(record.revisedAt)}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
