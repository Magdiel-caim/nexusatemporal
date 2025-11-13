/**
 * useOptimisticUpdate Hook
 *
 * Gerencia atualizações otimistas no cache do React Query
 * Permite atualizar a UI imediatamente enquanto a API processa
 * e faz rollback automático em caso de erro
 */

import { useQueryClient } from '@tanstack/react-query';
import { Appointment } from '../services/appointmentService';

export interface OptimisticUpdateContext {
  previousData: any;
  queryKey: any[];
}

export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  /**
   * Atualiza otimisticamente um agendamento no cache
   * Retorna o contexto para possível rollback
   */
  const updateAppointmentOptimistic = (
    appointmentId: string,
    updates: Partial<Appointment>,
    queryKey: any[] = ['appointments']
  ): OptimisticUpdateContext => {
    // Cancelar queries em andamento para evitar sobrescrever a atualização otimista
    queryClient.cancelQueries({ queryKey });

    // Snapshot do estado anterior para rollback
    const previousData = queryClient.getQueryData(queryKey);

    // Atualizar otimisticamente
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;

      // Se old for array (lista de appointments)
      if (Array.isArray(old)) {
        return old.map((apt: Appointment) =>
          apt.id === appointmentId ? { ...apt, ...updates } : apt
        );
      }

      // Se old for objeto paginado { data: [], total: N }
      if (old.data && Array.isArray(old.data)) {
        return {
          ...old,
          data: old.data.map((apt: Appointment) =>
            apt.id === appointmentId ? { ...apt, ...updates } : apt
          ),
        };
      }

      // Se old for objeto único
      if (old.id === appointmentId) {
        return { ...old, ...updates };
      }

      return old;
    });

    return { previousData, queryKey };
  };

  /**
   * Reverte a atualização otimista em caso de erro
   */
  const rollback = (context: OptimisticUpdateContext) => {
    if (context.previousData) {
      queryClient.setQueryData(context.queryKey, context.previousData);
    }
  };

  /**
   * Invalida queries para forçar refetch dos dados reais
   * Útil após sucesso da API para garantir sincronização
   */
  const invalidate = (queryKey: any[] = ['appointments']) => {
    queryClient.invalidateQueries({ queryKey });
  };

  /**
   * Atualização otimista com promise
   * Automatiza o processo de update -> API call -> rollback/confirm
   */
  const mutateWithOptimistic = async <T,>(
    appointmentId: string,
    updates: Partial<Appointment>,
    mutationFn: () => Promise<T>,
    options?: {
      queryKey?: any[];
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
    }
  ): Promise<T> => {
    const queryKey = options?.queryKey || ['appointments'];

    // 1. Update otimista
    const context = updateAppointmentOptimistic(appointmentId, updates, queryKey);

    try {
      // 2. Chamar API
      const result = await mutationFn();

      // 3. Sucesso - invalidar para garantir sincronização
      invalidate(queryKey);

      // 4. Callback de sucesso
      options?.onSuccess?.(result);

      return result;
    } catch (error) {
      // 5. Erro - fazer rollback
      rollback(context);

      // 6. Callback de erro
      options?.onError?.(error);

      throw error;
    }
  };

  /**
   * Remove um agendamento do cache otimisticamente
   */
  const removeAppointmentOptimistic = (
    appointmentId: string,
    queryKey: any[] = ['appointments']
  ): OptimisticUpdateContext => {
    queryClient.cancelQueries({ queryKey });

    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;

      if (Array.isArray(old)) {
        return old.filter((apt: Appointment) => apt.id !== appointmentId);
      }

      if (old.data && Array.isArray(old.data)) {
        return {
          ...old,
          data: old.data.filter((apt: Appointment) => apt.id !== appointmentId),
          total: old.total - 1,
        };
      }

      return old;
    });

    return { previousData, queryKey };
  };

  /**
   * Adiciona um agendamento ao cache otimisticamente
   */
  const addAppointmentOptimistic = (
    appointment: Appointment,
    queryKey: any[] = ['appointments']
  ): OptimisticUpdateContext => {
    queryClient.cancelQueries({ queryKey });

    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return [appointment];

      if (Array.isArray(old)) {
        return [...old, appointment];
      }

      if (old.data && Array.isArray(old.data)) {
        return {
          ...old,
          data: [...old.data, appointment],
          total: old.total + 1,
        };
      }

      return old;
    });

    return { previousData, queryKey };
  };

  return {
    updateAppointmentOptimistic,
    removeAppointmentOptimistic,
    addAppointmentOptimistic,
    rollback,
    invalidate,
    mutateWithOptimistic,
  };
}

export default useOptimisticUpdate;
