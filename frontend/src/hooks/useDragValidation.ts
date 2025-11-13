/**
 * useDragValidation Hook
 *
 * Centraliza todas as validações de drag & drop de agendamentos
 * Garante que apenas agendamentos editáveis sejam arrastados
 * e que sejam soltos em horários válidos
 */

import { Appointment } from '../services/appointmentService';

// Status que permitem edição via drag & drop
const EDITABLE_STATUSES = [
  'aguardando_pagamento',
  'pagamento_confirmado',
  'aguardando_confirmacao',
  'confirmado',
  'reagendado',
];

// Status que NÃO permitem edição
const NON_EDITABLE_STATUSES = [
  'em_atendimento',
  'finalizado',
  'cancelado',
  'nao_compareceu',
];

export interface DragValidationResult {
  valid: boolean;
  reason?: string;
}

export function useDragValidation() {
  /**
   * Valida se o agendamento pode ser arrastado
   * Verifica apenas o status do agendamento
   */
  const validateDragStart = (appointment: Appointment): DragValidationResult => {
    // Verifica se o status permite edição
    if (!EDITABLE_STATUSES.includes(appointment.status)) {
      const messages: Record<string, string> = {
        em_atendimento: 'Agendamentos em atendimento não podem ser reagendados',
        finalizado: 'Agendamentos finalizados não podem ser reagendados',
        cancelado: 'Agendamentos cancelados não podem ser reagendados',
        nao_compareceu: 'Agendamentos com "não compareceu" não podem ser reagendados',
      };

      return {
        valid: false,
        reason: messages[appointment.status] || 'Este agendamento não pode ser reagendado',
      };
    }

    return { valid: true };
  };

  /**
   * Valida se a nova data/hora é válida
   * Verifica: data no passado, horário comercial
   */
  const validateDragEnd = (
    newDate: Date,
    duration: number
  ): DragValidationResult => {
    const now = new Date();

    // 1. Verifica se a data é no passado
    if (newDate < now) {
      return {
        valid: false,
        reason: 'Não é possível agendar no passado',
      };
    }

    // 2. Verifica se está dentro do horário comercial (7h - 20h)
    const hour = newDate.getHours();
    const endTime = new Date(newDate.getTime() + duration * 60000);
    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();

    if (hour < 7) {
      return {
        valid: false,
        reason: 'Horário de início antes das 7h (horário de abertura)',
      };
    }

    // Permite até 20:00, mas o agendamento pode terminar depois
    if (hour >= 20) {
      return {
        valid: false,
        reason: 'Horário de início após as 20h (horário de fechamento)',
      };
    }

    // Aviso se terminar após 20h (mas não bloqueia)
    if (endHour > 20 || (endHour === 20 && endMinutes > 0)) {
      return {
        valid: true,
        reason: 'AVISO: O agendamento terminará após o horário de fechamento (20h)',
      };
    }

    return { valid: true };
  };

  /**
   * Verifica se a location mudou
   * Usado para mostrar modal de confirmação
   */
  const validateLocationChange = (
    oldLocation: string,
    newLocation: string
  ): { changed: boolean; message?: string } => {
    if (oldLocation !== newLocation) {
      return {
        changed: true,
        message: `Deseja alterar a localização de "${oldLocation}" para "${newLocation}"?`,
      };
    }

    return { changed: false };
  };

  /**
   * Verifica se a data mudou significativamente (dia diferente)
   * Útil para mostrar confirmações adicionais
   */
  const isSignificantChange = (oldDate: Date, newDate: Date): boolean => {
    const oldDay = oldDate.toISOString().split('T')[0];
    const newDay = newDate.toISOString().split('T')[0];

    return oldDay !== newDay;
  };

  /**
   * Formata mensagem de tooltip para eventos não editáveis
   */
  const getTooltipMessage = (status: string): string => {
    if (NON_EDITABLE_STATUSES.includes(status)) {
      const messages: Record<string, string> = {
        em_atendimento: 'Em atendimento - não pode ser reagendado',
        finalizado: 'Finalizado - não pode ser reagendado',
        cancelado: 'Cancelado - não pode ser reagendado',
        nao_compareceu: 'Não compareceu - não pode ser reagendado',
      };

      return messages[status] || 'Este agendamento não pode ser reagendado';
    }

    return 'Arraste para reagendar';
  };

  return {
    validateDragStart,
    validateDragEnd,
    validateLocationChange,
    isSignificantChange,
    getTooltipMessage,
    EDITABLE_STATUSES,
    NON_EDITABLE_STATUSES,
  };
}

export default useDragValidation;
