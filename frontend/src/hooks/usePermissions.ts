import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Permission, UserRole, UserPermissions } from '@/types/permissions';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Hook usePermissions
 *
 * Gerencia permissões do usuário e fornece funções para verificar acesso.
 *
 * @example
 * const { can, hasRole, isLoading } = usePermissions();
 *
 * if (can(Permission.LEADS_DELETE)) {
 *   // Mostrar botão de excluir
 * }
 *
 * if (hasRole([UserRole.OWNER, UserRole.ADMIN])) {
 *   // Mostrar seção administrativa
 * }
 */
export const usePermissions = () => {
  const { user, token } = useAuthStore();
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar permissões do usuário
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!token || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get<{
          success: boolean;
          data: UserPermissions;
        }>(`${API_URL}/users/permissions/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUserPermissions(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching permissions:', err);
        setError(err.response?.data?.message || 'Erro ao carregar permissões');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [token, user]);

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const can = useCallback(
    (permission: Permission | string): boolean => {
      if (!userPermissions) return false;

      // Super admin sempre pode
      if (userPermissions.isSuperAdmin) return true;

      return userPermissions.permissions.includes(permission);
    },
    [userPermissions]
  );

  /**
   * Verifica se o usuário tem TODAS as permissões especificadas (AND lógico)
   */
  const canAll = useCallback(
    (permissions: (Permission | string)[]): boolean => {
      if (!userPermissions) return false;
      if (userPermissions.isSuperAdmin) return true;

      return permissions.every(p => userPermissions.permissions.includes(p));
    },
    [userPermissions]
  );

  /**
   * Verifica se o usuário tem PELO MENOS UMA das permissões (OR lógico)
   */
  const canAny = useCallback(
    (permissions: (Permission | string)[]): boolean => {
      if (!userPermissions) return false;
      if (userPermissions.isSuperAdmin) return true;

      return permissions.some(p => userPermissions.permissions.includes(p));
    },
    [userPermissions]
  );

  /**
   * Verifica se o usuário tem um role específico
   */
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!userPermissions) return false;

      const rolesArray = Array.isArray(roles) ? roles : [roles];
      return rolesArray.includes(userPermissions.role);
    },
    [userPermissions]
  );

  /**
   * Verifica se o usuário é super admin
   */
  const isSuperAdmin = useCallback((): boolean => {
    return userPermissions?.isSuperAdmin || false;
  }, [userPermissions]);

  /**
   * Verifica se o usuário é owner
   */
  const isOwner = useCallback((): boolean => {
    return hasRole([UserRole.OWNER, UserRole.MANAGER]);
  }, [hasRole]);

  /**
   * Verifica se o usuário é admin
   */
  const isAdmin = useCallback((): boolean => {
    return hasRole(UserRole.ADMIN);
  }, [hasRole]);

  /**
   * Verifica se o usuário é professional
   */
  const isProfessional = useCallback((): boolean => {
    return hasRole([UserRole.PROFESSIONAL, UserRole.DOCTOR]);
  }, [hasRole]);

  return {
    userPermissions,
    isLoading,
    error,
    can,
    canAll,
    canAny,
    hasRole,
    isSuperAdmin,
    isOwner,
    isAdmin,
    isProfessional,
  };
};
