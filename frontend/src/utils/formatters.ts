/**
 * Formatters e helpers para manipulação segura de valores
 *
 * Este arquivo centraliza funções de formatação e conversão
 * para garantir consistência em todo o sistema.
 */

/**
 * Converte qualquer valor para número de forma segura
 *
 * Protege contra NaN, Infinity, null, undefined
 * Usa em TODOS os cálculos numéricos para prevenir "R$ NaN"
 *
 * @param value - Valor a ser convertido
 * @param defaultValue - Valor padrão se conversão falhar (default: 0)
 * @returns Número válido ou defaultValue
 *
 * @example
 * safeNumber(null) // 0
 * safeNumber(undefined) // 0
 * safeNumber("123") // 123
 * safeNumber("abc") // 0
 * safeNumber(NaN) // 0
 * safeNumber(Infinity) // 0
 * safeNumber(null, 100) // 100
 */
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  // Se já é número válido, retorna direto (performance)
  if (typeof value === 'number' && isFinite(value) && !isNaN(value)) {
    return value;
  }

  // Tenta converter
  const num = Number(value);

  // Valida se conversão resultou em número válido
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  return num;
};

/**
 * Formata valor como moeda brasileira (R$)
 *
 * Protege automaticamente contra NaN usando safeNumber
 *
 * @param value - Valor a ser formatado
 * @returns String formatada como "R$ X.XXX,XX"
 *
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(null) // "R$ 0,00"
 * formatCurrency(NaN) // "R$ 0,00"
 */
export const formatCurrency = (value: any): string => {
  const safeValue = safeNumber(value);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safeValue);
};

/**
 * Formata número com separador de milhares
 *
 * @param value - Valor a ser formatado
 * @param decimals - Número de casas decimais (default: 2)
 * @returns String formatada como "X.XXX,XX"
 *
 * @example
 * formatNumber(1234.56) // "1.234,56"
 * formatNumber(1234.567, 3) // "1.234,567"
 */
export const formatNumber = (value: any, decimals: number = 2): string => {
  const safeValue = safeNumber(value);

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeValue);
};

/**
 * Formata porcentagem
 *
 * @param value - Valor decimal (0.15 = 15%)
 * @param decimals - Casas decimais (default: 2)
 * @returns String formatada como "XX,XX%"
 *
 * @example
 * formatPercentage(0.1556) // "15,56%"
 * formatPercentage(0.1556, 1) // "15,6%"
 */
export const formatPercentage = (value: any, decimals: number = 2): string => {
  const safeValue = safeNumber(value);

  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeValue);
};

/**
 * Calcula soma segura de array de números
 *
 * Usa safeNumber para cada elemento, prevenindo NaN
 *
 * @param values - Array de valores
 * @returns Soma total
 *
 * @example
 * safeSum([1, 2, 3]) // 6
 * safeSum([1, null, 3]) // 4
 * safeSum([1, NaN, 3]) // 4
 */
export const safeSum = (values: any[]): number => {
  return values.reduce((sum, value) => sum + safeNumber(value), 0);
};

/**
 * Calcula média segura de array de números
 *
 * @param values - Array de valores
 * @returns Média ou 0 se array vazio
 *
 * @example
 * safeAverage([10, 20, 30]) // 20
 * safeAverage([10, null, 30]) // 13.33 (soma 40 / 3 itens)
 */
export const safeAverage = (values: any[]): number => {
  if (values.length === 0) return 0;
  return safeSum(values) / values.length;
};
