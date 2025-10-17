import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole } from '@/types/permissions';

interface ProtectedProps {
  children: React.ReactNode;
  permission?: Permission | string | (Permission | string)[];
  role?: UserRole | UserRole[];
  requireAll?: boolean; // Se true, requer TODAS as permissões. Se false, requer PELO MENOS UMA
  fallback?: React.ReactNode; // O que mostrar se não tiver permissão
  showLoading?: boolean; // Se deve mostrar loading enquanto carrega permissões
}

/**
 * Componente Protected
 *
 * Renderiza children apenas se o usuário tiver as permissões/roles necessários.
 *
 * @example
 * // Requerer uma permissão
 * <Protected permission={Permission.LEADS_DELETE}>
 *   <button>Excluir Lead</button>
 * </Protected>
 *
 * @example
 * // Requerer múltiplas permissões (AND lógico)
 * <Protected permission={[Permission.LEADS_DELETE, Permission.LEADS_UPDATE]} requireAll>
 *   <button>Editar e Excluir</button>
 * </Protected>
 *
 * @example
 * // Requerer pelo menos uma permissão (OR lógico)
 * <Protected permission={[Permission.LEADS_CREATE, Permission.LEADS_UPDATE]}>
 *   <button>Criar ou Editar</button>
 * </Protected>
 *
 * @example
 * // Requerer role específico
 * <Protected role={[UserRole.OWNER, UserRole.ADMIN]}>
 *   <FinancialDashboard />
 * </Protected>
 *
 * @example
 * // Com fallback
 * <Protected
 *   permission={Permission.FINANCIAL_VIEW_ALL}
 *   fallback={<p>Você não tem acesso a esta funcionalidade</p>}
 * >
 *   <FinancialReports />
 * </Protected>
 */
const Protected: React.FC<ProtectedProps> = ({
  children,
  permission,
  role,
  requireAll = false,
  fallback = null,
  showLoading = false,
}) => {
  const { can, canAll, canAny, hasRole, isLoading } = usePermissions();

  // Loading state
  if (isLoading && showLoading) {
    return <div className="flex items-center justify-center p-4">Carregando...</div>;
  }

  if (isLoading && !showLoading) {
    return null;
  }

  // Check permissions
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];

    if (permissions.length === 1) {
      // Single permission
      if (!can(permissions[0])) {
        return <>{fallback}</>;
      }
    } else {
      // Multiple permissions
      const hasPermissions = requireAll
        ? canAll(permissions) // Requer TODAS
        : canAny(permissions); // Requer PELO MENOS UMA

      if (!hasPermissions) {
        return <>{fallback}</>;
      }
    }
  }

  // Check roles
  if (role) {
    if (!hasRole(role)) {
      return <>{fallback}</>;
    }
  }

  // User has permission, render children
  return <>{children}</>;
};

export default Protected;
