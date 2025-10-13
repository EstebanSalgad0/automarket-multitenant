import { useAuth } from '../hooks/useAuth'
import { UserRole, Permission, PermissionManager } from '../lib/permissions'

/**
 * Hook para verificar permisos del usuario actual
 */
export function usePermissions() {
  const { user } = useAuth()
  
  const userRole = user?.user_metadata?.role as UserRole || UserRole.VIEWER
  
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    return PermissionManager.hasPermission(userRole, permission)
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    return PermissionManager.hasAllPermissions(userRole, permissions)
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false
    return PermissionManager.hasAnyPermission(userRole, permissions)
  }

  /**
   * Verifica si el usuario tiene un rol mínimo requerido
   */
  const hasMinimumRole = (requiredRole: UserRole): boolean => {
    if (!user) return false
    return PermissionManager.hasMinimumRole(userRole, requiredRole)
  }

  /**
   * Verifica si el usuario puede gestionar a otro usuario
   */
  const canManageUser = (targetRole: UserRole): boolean => {
    if (!user) return false
    return PermissionManager.canManageUser(userRole, targetRole)
  }

  /**
   * Verifica si el usuario es administrador (corporativo o super)
   */
  const isAdmin = (): boolean => {
    return hasAnyPermission([Permission.MANAGE_EMPLOYEES, Permission.MANAGE_TENANT_SETTINGS])
  }

  /**
   * Verifica si el usuario es gerente (branch o sales manager)
   */
  const isManager = (): boolean => {
    return hasMinimumRole(UserRole.SALES_MANAGER)
  }

  /**
   * Verifica si el usuario puede ver datos financieros
   */
  const canViewFinancials = (): boolean => {
    return hasPermission(Permission.VIEW_FINANCIAL_REPORTS)
  }

  /**
   * Verifica si el usuario puede gestionar empleados
   */
  const canManageEmployees = (): boolean => {
    return hasPermission(Permission.MANAGE_EMPLOYEES)
  }

  /**
   * Verifica si el usuario puede gestionar vehículos de otros
   */
  const canManageAllVehicles = (): boolean => {
    return hasAnyPermission([Permission.EDIT_ALL_VEHICLES, Permission.DELETE_ALL_VEHICLES])
  }

  return {
    userRole,
    user,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasMinimumRole,
    canManageUser,
    isAdmin,
    isManager,
    canViewFinancials,
    canManageEmployees,
    canManageAllVehicles,
    permissions: PermissionManager.getRolePermissions(userRole)
  }
}

/**
 * Hook para validar acciones específicas
 */
export function useActionValidation() {
  const { hasPermission, canManageUser } = usePermissions()

  /**
   * Valida si el usuario puede despedir a un empleado
   */
  const canFireEmployee = (employeeRole: UserRole): boolean => {
    return hasPermission(Permission.MANAGE_EMPLOYEES) && canManageUser(employeeRole)
  }

  /**
   * Valida si el usuario puede contratar empleados
   */
  const canHireEmployee = (): boolean => {
    return hasPermission(Permission.MANAGE_EMPLOYEES)
  }

  /**
   * Valida si el usuario puede eliminar un vehículo específico
   */
  const canDeleteVehicle = (vehicleOwnerId: string, currentUserId: string): boolean => {
    // Puede eliminar si tiene permiso global O si es el propietario con permiso propio
    return hasPermission(Permission.DELETE_ALL_VEHICLES) ||
           (vehicleOwnerId === currentUserId && hasPermission(Permission.DELETE_OWN_VEHICLES))
  }

  /**
   * Valida si el usuario puede editar un vehículo específico
   */
  const canEditVehicle = (vehicleOwnerId: string, currentUserId: string): boolean => {
    return hasPermission(Permission.EDIT_ALL_VEHICLES) ||
           (vehicleOwnerId === currentUserId && hasPermission(Permission.EDIT_OWN_VEHICLES))
  }

  /**
   * Valida si el usuario puede ver leads específicos
   */
  const canViewLeads = (leadOwnerId?: string, currentUserId?: string): boolean => {
    if (hasPermission(Permission.VIEW_ALL_LEADS)) return true
    if (leadOwnerId && currentUserId && leadOwnerId === currentUserId) {
      return hasPermission(Permission.VIEW_OWN_LEADS)
    }
    return false
  }

  /**
   * Valida si el usuario puede cambiar roles de otros usuarios
   */
  const canChangeUserRole = (targetRole: UserRole): boolean => {
    return hasPermission(Permission.MANAGE_ROLES) && canManageUser(targetRole)
  }

  return {
    canFireEmployee,
    canHireEmployee,
    canDeleteVehicle,
    canEditVehicle,
    canViewLeads,
    canChangeUserRole
  }
}

/**
 * Hook para obtener información contextual de seguridad
 */
export function useSecurityContext() {
  const { user, userRole, isAdmin, isManager } = usePermissions()
  
  const tenantId = user?.user_metadata?.tenant_id
  const branchId = user?.user_metadata?.branch_id
  const userId = user?.id

  /**
   * Verifica si el usuario pertenece al mismo tenant
   */
  const isSameTenant = (targetTenantId: string): boolean => {
    return tenantId === targetTenantId
  }

  /**
   * Verifica si el usuario pertenece a la misma sucursal
   */
  const isSameBranch = (targetBranchId: string): boolean => {
    return branchId === targetBranchId
  }

  /**
   * Obtiene el contexto de seguridad para filtros de datos
   */
  const getSecurityContext = () => {
    return {
      userId,
      tenantId,
      branchId,
      role: userRole,
      isAdmin: isAdmin(),
      isManager: isManager()
    }
  }

  return {
    tenantId,
    branchId,
    userId,
    userRole,
    isSameTenant,
    isSameBranch,
    getSecurityContext
  }
}