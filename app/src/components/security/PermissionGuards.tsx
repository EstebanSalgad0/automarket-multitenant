import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { Permission, UserRole } from '../../lib/permissions'

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean // Si es true, requiere TODOS los permisos. Si es false, requiere AL MENOS UNO
  role?: UserRole
  fallback?: React.ReactNode
  showFallback?: boolean
}

/**
 * Componente que renderiza contenido solo si el usuario tiene los permisos necesarios
 */
export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  role,
  fallback = null,
  showFallback = true
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, hasMinimumRole } = usePermissions()

  let hasAccess = true

  // Verificar permiso único
  if (permission) {
    hasAccess = hasPermission(permission)
  }

  // Verificar múltiples permisos
  if (permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  // Verificar rol mínimo
  if (role && hasAccess) {
    hasAccess = hasMinimumRole(role)
  }

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showUnauthorized?: boolean
}

/**
 * Guard específico para administradores
 */
export function AdminGuard({ children, fallback, showUnauthorized = true }: AdminGuardProps) {
  return (
    <PermissionGuard
      permissions={[Permission.MANAGE_EMPLOYEES, Permission.MANAGE_TENANT_SETTINGS]}
      requireAll={false}
      fallback={fallback || (showUnauthorized ? <UnauthorizedMessage /> : null)}
      showFallback={showUnauthorized}
    >
      {children}
    </PermissionGuard>
  )
}

interface ManagerGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showUnauthorized?: boolean
}

/**
 * Guard específico para gerentes y superiores
 */
export function ManagerGuard({ children, fallback, showUnauthorized = true }: ManagerGuardProps) {
  return (
    <PermissionGuard
      role={UserRole.SALES_MANAGER}
      fallback={fallback || (showUnauthorized ? <UnauthorizedMessage /> : null)}
      showFallback={showUnauthorized}
    >
      {children}
    </PermissionGuard>
  )
}

interface SellerGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Guard para vendedores (independientes, concesionarios, empleados)
 */
export function SellerGuard({ children, fallback }: SellerGuardProps) {
  return (
    <PermissionGuard
      permissions={[Permission.CREATE_VEHICLES, Permission.EDIT_OWN_VEHICLES]}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

interface CustomerGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Guard para clientes
 */
export function CustomerGuard({ children, fallback }: CustomerGuardProps) {
  return (
    <PermissionGuard
      permissions={[Permission.VIEW_VEHICLES, Permission.CREATE_INQUIRIES]}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * Componente de mensaje de acceso no autorizado
 */
export function UnauthorizedMessage() {
  return (
    <div className="unauthorized-message">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">🔒</div>
        <h3>Acceso No Autorizado</h3>
        <p>No tienes permisos suficientes para ver este contenido.</p>
        <p>Contacta al administrador si necesitas acceso.</p>
      </div>
    </div>
  )
}

/**
 * Componente para mostrar acciones condicionales
 */
interface ConditionalActionProps {
  children: React.ReactNode
  condition: boolean
  fallback?: React.ReactNode
  tooltip?: string
}

export function ConditionalAction({ children, condition, fallback, tooltip }: ConditionalActionProps) {
  if (!condition) {
    return fallback ? (
      <div title={tooltip} className="disabled-action">
        {fallback}
      </div>
    ) : null
  }

  return <>{children}</>
}

/**
 * HOC para proteger componentes completos
 */
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission[],
  requireAll = false
) {
  return function ProtectedComponent(props: P) {
    return (
      <PermissionGuard 
        permissions={requiredPermissions} 
        requireAll={requireAll}
        showFallback={true}
      >
        <Component {...props} />
      </PermissionGuard>
    )
  }
}

/**
 * HOC para proteger componentes con rol mínimo
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  minimumRole: UserRole
) {
  return function RoleProtectedComponent(props: P) {
    return (
      <PermissionGuard 
        role={minimumRole}
        showFallback={true}
      >
        <Component {...props} />
      </PermissionGuard>
    )
  }
}

// Styles para UnauthorizedMessage
const unauthorizedStyles = `
.unauthorized-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  margin: 20px 0;
}

.unauthorized-content {
  text-align: center;
  max-width: 400px;
}

.unauthorized-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.unauthorized-content h3 {
  color: #6c757d;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.unauthorized-content p {
  color: #6c757d;
  margin-bottom: 8px;
  line-height: 1.5;
}

.disabled-action {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
`

// Inyectar estilos en el documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = unauthorizedStyles
  document.head.appendChild(styleElement)
}