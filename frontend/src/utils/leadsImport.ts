import * as XLSX from 'xlsx';

// Interface para leads importados (sem ID)
export interface ImportedLead {
  name?: string;
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  status?: 'active' | 'won' | 'lost';
  priority?: 'low' | 'medium' | 'high';
  source?: 'website' | 'referral' | 'social_media' | 'email' | 'phone' | 'other';
  channel?: 'whatsapp' | 'phone' | 'email' | 'instagram' | 'facebook' | 'website' | 'in_person' | 'other';
  attendanceLocation?: 'moema' | 'perdizes' | 'online' | 'a_domicilio';
  clientStatus?: 'conversa_iniciada' | 'agendamento_pendente' | 'agendado' | 'em_tratamento' | 'finalizado' | 'cancelado';
  estimatedValue?: number;
  notes?: string;
  company?: string;
  position?: string;
}

// Resultado da importação
export interface ImportResult {
  success: boolean;
  leads: ImportedLead[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

// Normalizar cabeçalhos (remover acentos, espaços, etc)
const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, '_')
    .trim();
};

// Mapeamento de cabeçalhos flexível
const headerMapping: Record<string, string> = {
  'nome': 'name',
  'name': 'name',
  'telefone': 'phone',
  'phone': 'phone',
  'tel': 'phone',
  'telefone_2': 'phone2',
  'phone2': 'phone2',
  'whatsapp': 'whatsapp',
  'wpp': 'whatsapp',
  'zap': 'whatsapp',
  'email': 'email',
  'e-mail': 'email',
  'mail': 'email',
  'cidade': 'city',
  'city': 'city',
  'estado': 'state',
  'state': 'state',
  'bairro': 'neighborhood',
  'neighborhood': 'neighborhood',
  'status': 'status',
  'prioridade': 'priority',
  'priority': 'priority',
  'origem': 'source',
  'source': 'source',
  'canal': 'channel',
  'channel': 'channel',
  'local_de_atendimento': 'attendanceLocation',
  'local_atendimento': 'attendanceLocation',
  'attendance_location': 'attendanceLocation',
  'situacao_do_cliente': 'clientStatus',
  'situacao_cliente': 'clientStatus',
  'client_status': 'clientStatus',
  'valor_estimado': 'estimatedValue',
  'valor': 'estimatedValue',
  'estimated_value': 'estimatedValue',
  'observacoes': 'notes',
  'obs': 'notes',
  'notes': 'notes',
  'empresa': 'company',
  'company': 'company',
  'cargo': 'position',
  'position': 'position',
};

// Validar e converter linha de dados
const validateAndConvertRow = (row: any, rowIndex: number): { lead?: ImportedLead; error?: string } => {
  const lead: ImportedLead = {};

  // Nome é obrigatório
  if (!row.name || row.name.trim() === '') {
    return { error: `Linha ${rowIndex + 2}: Nome é obrigatório` };
  }

  lead.name = String(row.name).trim();

  // Campos opcionais
  if (row.phone) lead.phone = String(row.phone).trim();
  if (row.phone2) lead.phone2 = String(row.phone2).trim();
  if (row.whatsapp) lead.whatsapp = String(row.whatsapp).trim();
  if (row.email) lead.email = String(row.email).trim();
  if (row.city) lead.city = String(row.city).trim();
  if (row.state) lead.state = String(row.state).trim();
  if (row.neighborhood) lead.neighborhood = String(row.neighborhood).trim();
  if (row.status) lead.status = String(row.status).trim() as any;
  if (row.priority) lead.priority = String(row.priority).trim() as any;
  if (row.source) lead.source = String(row.source).trim() as any;
  if (row.channel) lead.channel = String(row.channel).trim() as any;
  if (row.attendanceLocation) lead.attendanceLocation = String(row.attendanceLocation).trim() as any;
  if (row.clientStatus) lead.clientStatus = String(row.clientStatus).trim() as any;
  if (row.notes) lead.notes = String(row.notes).trim();
  if (row.company) lead.company = String(row.company).trim();
  if (row.position) lead.position = String(row.position).trim();

  // Valor estimado (converter para número)
  if (row.estimatedValue) {
    const value = String(row.estimatedValue)
      .replace(/[^\d,.-]/g, '')
      .replace(',', '.');
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      lead.estimatedValue = numValue;
    }
  }

  return { lead };
};

// Mapear cabeçalhos do arquivo para os campos internos
const mapHeaders = (headers: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};

  headers.forEach(header => {
    const normalized = normalizeHeader(header);
    const mappedField = headerMapping[normalized];
    if (mappedField) {
      mapping[header] = mappedField;
    }
  });

  return mapping;
};

// Importar de XLSX ou CSV
export const importFromFile = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Pegar primeira planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Converter para JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (rawData.length === 0) {
          resolve({
            success: false,
            leads: [],
            errors: ['Arquivo vazio'],
            totalRows: 0,
            validRows: 0,
          });
          return;
        }

        // Primeira linha são os cabeçalhos
        const headers = rawData[0] as string[];
        const headerMap = mapHeaders(headers);

        // Converter dados
        const leads: ImportedLead[] = [];
        const errors: string[] = [];

        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];

          // Pular linhas vazias
          if (!row || row.length === 0 || row.every(cell => !cell)) {
            continue;
          }

          // Criar objeto com cabeçalhos mapeados
          const rowObject: any = {};
          headers.forEach((header, index) => {
            const mappedField = headerMap[header];
            if (mappedField && row[index] !== undefined) {
              rowObject[mappedField] = row[index];
            }
          });

          // Validar e converter
          const result = validateAndConvertRow(rowObject, i - 1);
          if (result.error) {
            errors.push(result.error);
          } else if (result.lead) {
            leads.push(result.lead);
          }
        }

        resolve({
          success: errors.length === 0,
          leads,
          errors,
          totalRows: rawData.length - 1,
          validRows: leads.length,
        });
      } catch (error: any) {
        resolve({
          success: false,
          leads: [],
          errors: [`Erro ao processar arquivo: ${error.message}`],
          totalRows: 0,
          validRows: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        leads: [],
        errors: ['Erro ao ler arquivo'],
        totalRows: 0,
        validRows: 0,
      });
    };

    // Ler arquivo
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

// Importar de JSON
export const importFromJSON = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
          resolve({
            success: false,
            leads: [],
            errors: ['Arquivo JSON deve conter um array de objetos'],
            totalRows: 0,
            validRows: 0,
          });
          return;
        }

        const leads: ImportedLead[] = [];
        const errors: string[] = [];

        data.forEach((item, index) => {
          const result = validateAndConvertRow(item, index);
          if (result.error) {
            errors.push(result.error);
          } else if (result.lead) {
            leads.push(result.lead);
          }
        });

        resolve({
          success: errors.length === 0,
          leads,
          errors,
          totalRows: data.length,
          validRows: leads.length,
        });
      } catch (error: any) {
        resolve({
          success: false,
          leads: [],
          errors: [`Erro ao processar JSON: ${error.message}`],
          totalRows: 0,
          validRows: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        leads: [],
        errors: ['Erro ao ler arquivo'],
        totalRows: 0,
        validRows: 0,
      });
    };

    reader.readAsText(file);
  });
};

// Função principal de importação
export const importLeads = async (file: File): Promise<ImportResult> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  switch (fileExtension) {
    case 'xlsx':
    case 'xls':
    case 'csv':
      return importFromFile(file);
    case 'json':
      return importFromJSON(file);
    default:
      return {
        success: false,
        leads: [],
        errors: [`Formato de arquivo não suportado: ${fileExtension}`],
        totalRows: 0,
        validRows: 0,
      };
  }
};
