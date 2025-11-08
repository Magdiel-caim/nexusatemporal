/**
 * Utilitários de Data e Timezone
 *
 * REGRAS CRÍTICAS:
 * 1. Datas PURAS (YYYY-MM-DD): SEM timezone - representam um dia específico
 * 2. Date-TIME (agendamentos): COM timezone São Paulo
 * 3. NUNCA aplicar timezone em datas que não têm horário!
 */

export const SYSTEM_TIMEZONE = 'America/Sao_Paulo';

/**
 * Obtém a data/hora ATUAL no timezone de São Paulo
 * USO: Para comparações de horários de agendamento
 */
export function getNowInSaoPaulo(): Date {
  const now = new Date();
  const saoPauloString = now.toLocaleString('en-US', {
    timeZone: SYSTEM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return new Date(saoPauloString);
}

/**
 * Obtém HOJE em formato YYYY-MM-DD (no timezone de São Paulo)
 * USO: Para min do input date, filtros, comparações de dia
 */
export function getTodayString(): string {
  const now = getNowInSaoPaulo();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata data PURA para exibição brasileira (DD/MM/YYYY)
 * IMPORTANTE: Não usa timezone! Data pura representa um dia específico.
 *
 * @param date - String "YYYY-MM-DD" ou Date
 * @returns String "DD/MM/YYYY"
 */
export function formatDateBR(date: Date | string): string {
  if (typeof date === 'string') {
    // Se é string "YYYY-MM-DD", faz parse direto SEM timezone
    const [year, month, day] = date.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }

  // Se é Date, pega dia/mês/ano local
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata data/hora COMPLETA para exibição (DD/MM/YYYY HH:mm)
 * USA timezone de São Paulo
 *
 * @param date - Date object ou string ISO
 * @returns String "DD/MM/YYYY HH:mm"
 */
export function formatDateTimeBR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleString('pt-BR', {
    timeZone: SYSTEM_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Cria Date para agendamento no timezone de São Paulo
 *
 * @param date - "YYYY-MM-DD"
 * @param time - "HH:mm"
 * @returns Date object configurado para São Paulo
 */
export function createDateTimeInSaoPaulo(date: string, time: string): Date {
  // Cria date-time no horário de São Paulo
  // Usamos o formato ISO com offset -03:00 (São Paulo)
  const [hours, minutes] = time.split(':').map(Number);
  const isoString = `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000-03:00`;
  return new Date(isoString);
}

/**
 * Verifica se horário de agendamento JÁ PASSOU
 * Compara com horário ATUAL de São Paulo
 *
 * @param date - "YYYY-MM-DD"
 * @param time - "HH:mm"
 * @returns true se já passou
 */
export function isPastTime(date: string, time: string): boolean {
  if (!date || !time) return false;

  const slotDateTime = createDateTimeInSaoPaulo(date, time);
  const now = getNowInSaoPaulo();

  return slotDateTime < now;
}

/**
 * Verifica se uma data YYYY-MM-DD é ANTES de hoje
 * Compara apenas DIA, sem considerar horário
 */
export function isBeforeToday(dateString: string): boolean {
  const today = getTodayString();
  return dateString < today;
}

/**
 * Verifica se uma data YYYY-MM-DD é hoje
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayString();
}

/**
 * Converte Date para input type="date" (YYYY-MM-DD)
 * Retorna a data LOCAL do Date object, sem conversão de timezone
 */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtém horário atual de São Paulo no formato HH:mm
 */
export function getCurrentTimeInSaoPaulo(): string {
  const now = getNowInSaoPaulo();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
