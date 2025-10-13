// Sistema de roles y permisos para AutoMarket MultiTenant
export const UserRole = {
  // Roles corporativos (nivel más alto)
  SUPER_ADMIN: 'super_admin',              // Administrador de la plataforma
  CORPORATE_ADMIN: 'corporate_admin',      // Administrador corporativo del tenant
  
  // Roles de gestión
  BRANCH_MANAGER: 'branch_manager',        // Gerente de sucursal
  SALES_MANAGER: 'sales_manager',          // Gerente de ventas
  
  // Roles operativos
  SALESPERSON: 'salesperson',              // Vendedor/a
  DEALER: 'dealer',                        // Concesionario/distribuidor
  INDEPENDENT_SELLER: 'independent_seller', // Vendedor independiente
  
  // Roles de cliente
  CUSTOMER: 'customer',                    // Cliente regular
  PREMIUM_CUSTOMER: 'premium_customer',    // Cliente premium
  
  // Roles de soporte
  SUPPORT_AGENT: 'support_agent',          // Agente de soporte
  VIEWER: 'viewer'                         // Solo lectura
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export const Permission = {
  // Gestión de usuarios y empleados
  MANAGE_EMPLOYEES: 'manage_employees',           // Contratar/despedir empleados
  VIEW_EMPLOYEES: 'view_employees',               // Ver lista de empleados
  EDIT_EMPLOYEE_PROFILES: 'edit_employee_profiles', // Editar perfiles de empleados
  
  // Gestión de vehículos
  CREATE_VEHICLES: 'create_vehicles',             // Publicar vehículos
  EDIT_OWN_VEHICLES: 'edit_own_vehicles',         // Editar sus propios vehículos
  EDIT_ALL_VEHICLES: 'edit_all_vehicles',         // Editar cualquier vehículo
  DELETE_OWN_VEHICLES: 'delete_own_vehicles',     // Eliminar sus propios vehículos
  DELETE_ALL_VEHICLES: 'delete_all_vehicles',     // Eliminar cualquier vehículo
  VIEW_VEHICLE_ANALYTICS: 'view_vehicle_analytics', // Ver estadísticas de vehículos
  
  // Gestión de leads y ventas
  VIEW_OWN_LEADS: 'view_own_leads',               // Ver sus propios leads
  VIEW_ALL_LEADS: 'view_all_leads',               // Ver todos los leads
  MANAGE_LEADS: 'manage_leads',                   // Asignar/reasignar leads
  CLOSE_DEALS: 'close_deals',                     // Cerrar ventas
  
  // Gestión financiera
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports', // Ver reportes financieros
  MANAGE_PRICING: 'manage_pricing',                 // Gestionar precios
  VIEW_COMMISSIONS: 'view_commissions',             // Ver comisiones
  
  // Gestión de sucursales
  MANAGE_BRANCHES: 'manage_branches',             // Crear/editar sucursales
  VIEW_BRANCH_PERFORMANCE: 'view_branch_performance', // Ver rendimiento de sucursales
  
  // Configuración del sistema
  MANAGE_TENANT_SETTINGS: 'manage_tenant_settings', // Configuración del tenant
  MANAGE_ROLES: 'manage_roles',                     // Gestionar roles de usuarios
  VIEW_AUDIT_LOGS: 'view_audit_logs',               // Ver logs de auditoría
  
  // Accesos de cliente
  VIEW_VEHICLES: 'view_vehicles',                   // Ver catálogo de vehículos
  CREATE_INQUIRIES: 'create_inquiries',             // Crear consultas
  MANAGE_FAVORITES: 'manage_favorites',             // Gestionar favoritos
  VIEW_OWN_PROFILE: 'view_own_profile',             // Ver su propio perfil
  EDIT_OWN_PROFILE: 'edit_own_profile'              // Editar su propio perfil
} as const

export type Permission = typeof Permission[keyof typeof Permission]

// Mapeo de roles a permisos
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Tiene todos los permisos
    ...(Object.values(Permission) as Permission[])
  ],
  
  [UserRole.CORPORATE_ADMIN]: [
    Permission.MANAGE_EMPLOYEES,
    Permission.VIEW_EMPLOYEES,
    Permission.EDIT_EMPLOYEE_PROFILES,
    Permission.EDIT_ALL_VEHICLES,
    Permission.DELETE_ALL_VEHICLES,
    Permission.VIEW_VEHICLE_ANALYTICS,
    Permission.VIEW_ALL_LEADS,
    Permission.MANAGE_LEADS,
    Permission.CLOSE_DEALS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.MANAGE_PRICING,
    Permission.VIEW_COMMISSIONS,
    Permission.MANAGE_BRANCHES,
    Permission.VIEW_BRANCH_PERFORMANCE,
    Permission.MANAGE_TENANT_SETTINGS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES
  ],
  
  [UserRole.BRANCH_MANAGER]: [
    Permission.VIEW_EMPLOYEES,
    Permission.EDIT_EMPLOYEE_PROFILES,
    Permission.EDIT_ALL_VEHICLES,
    Permission.VIEW_VEHICLE_ANALYTICS,
    Permission.VIEW_ALL_LEADS,
    Permission.MANAGE_LEADS,
    Permission.CLOSE_DEALS,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.VIEW_COMMISSIONS,
    Permission.VIEW_BRANCH_PERFORMANCE,
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES
  ],
  
  [UserRole.SALES_MANAGER]: [
    Permission.VIEW_EMPLOYEES,
    Permission.VIEW_ALL_LEADS,
    Permission.MANAGE_LEADS,
    Permission.CLOSE_DEALS,
    Permission.VIEW_COMMISSIONS,
    Permission.VIEW_BRANCH_PERFORMANCE,
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES,
    Permission.EDIT_OWN_VEHICLES,
    Permission.DELETE_OWN_VEHICLES
  ],
  
  [UserRole.SALESPERSON]: [
    Permission.VIEW_OWN_LEADS,
    Permission.CLOSE_DEALS,
    Permission.VIEW_COMMISSIONS,
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES,
    Permission.EDIT_OWN_VEHICLES,
    Permission.DELETE_OWN_VEHICLES,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE
  ],
  
  [UserRole.DEALER]: [
    Permission.VIEW_OWN_LEADS,
    Permission.CLOSE_DEALS,
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES,
    Permission.EDIT_OWN_VEHICLES,
    Permission.DELETE_OWN_VEHICLES,
    Permission.VIEW_VEHICLE_ANALYTICS,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE
  ],
  
  [UserRole.INDEPENDENT_SELLER]: [
    Permission.VIEW_OWN_LEADS,
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES,
    Permission.EDIT_OWN_VEHICLES,
    Permission.DELETE_OWN_VEHICLES,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE
  ],
  
  [UserRole.CUSTOMER]: [
    Permission.VIEW_VEHICLES,
    Permission.CREATE_INQUIRIES,
    Permission.MANAGE_FAVORITES,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE
  ],
  
  [UserRole.PREMIUM_CUSTOMER]: [
    Permission.VIEW_VEHICLES,
    Permission.CREATE_INQUIRIES,
    Permission.MANAGE_FAVORITES,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_VEHICLE_ANALYTICS // Acceso premium
  ],
  
  [UserRole.SUPPORT_AGENT]: [
    Permission.VIEW_EMPLOYEES,
    Permission.VIEW_ALL_LEADS,
    Permission.VIEW_VEHICLES,
    Permission.VIEW_OWN_PROFILE
  ],
  
  [UserRole.VIEWER]: [
    Permission.VIEW_VEHICLES,
    Permission.VIEW_OWN_PROFILE
  ]
}

// Jerarquía de roles (para herencia de permisos)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.CORPORATE_ADMIN]: 90,
  [UserRole.BRANCH_MANAGER]: 80,
  [UserRole.SALES_MANAGER]: 70,
  [UserRole.DEALER]: 60,
  [UserRole.SALESPERSON]: 50,
  [UserRole.INDEPENDENT_SELLER]: 40,
  [UserRole.PREMIUM_CUSTOMER]: 30,
  [UserRole.CUSTOMER]: 20,
  [UserRole.SUPPORT_AGENT]: 15,
  [UserRole.VIEWER]: 10
}

// Funciones de utilidad
export class PermissionManager {
  /**
   * Verifica si un rol tiene un permiso específico
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role] || []
    return rolePermissions.includes(permission)
  }

  /**
   * Obtiene todos los permisos de un rol
   */
  static getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || []
  }

  /**
   * Verifica si un rol tiene nivel jerárquico suficiente
   */
  static hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const userLevel = ROLE_HIERARCHY[userRole] || 0
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
    return userLevel >= requiredLevel
  }

  /**
   * Verifica múltiples permisos (AND - todos deben estar presentes)
   */
  static hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission))
  }

  /**
   * Verifica múltiples permisos (OR - al menos uno debe estar presente)
   */
  static hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission))
  }

  /**
   * Obtiene roles que tienen un permiso específico
   */
  static getRolesWithPermission(permission: Permission): UserRole[] {
    return Object.entries(ROLE_PERMISSIONS)
      .filter(([_, permissions]) => permissions.includes(permission))
      .map(([role, _]) => role as UserRole)
  }

  /**
   * Verifica si un usuario puede realizar una acción sobre otro usuario
   */
  static canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    const managerLevel = ROLE_HIERARCHY[managerRole] || 0
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0
    
    // Solo puede gestionar usuarios de nivel inferior
    return managerLevel > targetLevel
  }
}

// Constantes para acciones específicas
export const PROTECTED_ACTIONS = {
  FIRE_EMPLOYEE: [Permission.MANAGE_EMPLOYEES],
  HIRE_EMPLOYEE: [Permission.MANAGE_EMPLOYEES],
  EDIT_USER_ROLE: [Permission.MANAGE_ROLES],
  DELETE_VEHICLE: [Permission.DELETE_OWN_VEHICLES, Permission.DELETE_ALL_VEHICLES],
  VIEW_FINANCIALS: [Permission.VIEW_FINANCIAL_REPORTS],
  MANAGE_BRANCH: [Permission.MANAGE_BRANCHES],
  VIEW_AUDIT: [Permission.VIEW_AUDIT_LOGS]
} as const

export default PermissionManager