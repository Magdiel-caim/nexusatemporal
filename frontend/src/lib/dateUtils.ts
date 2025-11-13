/**
 * Formata uma data para o formato YYYY-MM-DD
 * Garante que a data seja sempre válida e bem formatada
 */
export function formatDateToISO(date: Date | string): string {
  let d: Date;

  if (typeof date === 'string') {
    // Se já está no formato ISO, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    d = new Date(date);
  } else {
    d = date;
  }

  // Validar se a data é válida
  if (isNaN(d.getTime())) {
    console.error('[dateUtils] Data inválida:', date);
    return new Date().toISOString().split('T')[0];
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Obtém a data de hoje no formato YYYY-MM-DD
 */
export function getTodayISO(): string {
  return formatDateToISO(new Date());
}
