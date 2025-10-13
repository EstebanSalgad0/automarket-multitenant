import { supabase } from '../lib/supabase'
import { UserRole } from '../lib/permissions'

export interface AuditEvent {
  id?: string
  user_id: string
  user_email?: string
  user_role?: UserRole
  tenant_id: string
  event_type: AuditEventType
  resource_type: ResourceType
  resource_id?: string
  action: string
  description: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  created_at?: string
}

export const AuditEventType = {
  // Autenticación
  AUTH_LOGIN: 'auth_login',
  AUTH_LOGOUT: 'auth_logout',
  AUTH_FAILED_LOGIN: 'auth_failed_login',
  AUTH_PASSWORD_CHANGE: 'auth_password_change',
  
  // Gestión de usuarios
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_SUSPENDED: 'user_suspended',
  USER_ACTIVATED: 'user_activated',
  
  // Gestión de empleados
  EMPLOYEE_HIRED: 'employee_hired',
  EMPLOYEE_FIRED: 'employee_fired',
  EMPLOYEE_PROMOTED: 'employee_promoted',
  EMPLOYEE_PROFILE_UPDATED: 'employee_profile_updated',
  
  // Gestión de vehículos
  VEHICLE_CREATED: 'vehicle_created',
  VEHICLE_UPDATED: 'vehicle_updated',
  VEHICLE_DELETED: 'vehicle_deleted',
  VEHICLE_STATUS_CHANGED: 'vehicle_status_changed',
  VEHICLE_PRICE_CHANGED: 'vehicle_price_changed',
  
  // Gestión de leads/ventas
  LEAD_CREATED: 'lead_created',
  LEAD_ASSIGNED: 'lead_assigned',
  LEAD_STATUS_CHANGED: 'lead_status_changed',
  DEAL_CLOSED: 'deal_closed',
  
  // Configuración del sistema
  SETTINGS_UPDATED: 'settings_updated',
  ROLE_PERMISSIONS_CHANGED: 'role_permissions_changed',
  BRANCH_CREATED: 'branch_created',
  BRANCH_UPDATED: 'branch_updated',
  
  // Seguridad
  SECURITY_VIOLATION: 'security_violation',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  
  // Datos críticos
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  BULK_DELETE: 'bulk_delete'
} as const

export type AuditEventType = typeof AuditEventType[keyof typeof AuditEventType]

export const ResourceType = {
  USER: 'user',
  EMPLOYEE: 'employee',
  VEHICLE: 'vehicle',
  LEAD: 'lead',
  BRANCH: 'branch',
  TENANT: 'tenant',
  SETTING: 'setting',
  REPORT: 'report'
} as const

export type ResourceType = typeof ResourceType[keyof typeof ResourceType]

/**
 * Servicio de auditoría para registrar todas las acciones críticas del sistema
 */
export class AuditService {
  private static instance: AuditService

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService()
    }
    return AuditService.instance
  }

  /**
   * Registrar evento de auditoría
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      const auditEvent: AuditEvent = {
        ...event,
        ip_address: event.ip_address || await this.getUserIP(),
        user_agent: event.user_agent || navigator.userAgent,
        created_at: new Date().toISOString()
      }

      await (supabase as any)
        .from('audit_logs')
        .insert([auditEvent])

      // Para eventos críticos, también log en consola en desarrollo
      if (this.isCriticalEvent(event.event_type)) {
        console.info('🔒 AUDIT EVENT:', {
          type: event.event_type,
          user: event.user_email,
          action: event.action,
          resource: `${event.resource_type}:${event.resource_id}`,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error logging audit event:', error)
      // En caso de error, al menos log en consola para no perder el evento
      console.warn('AUDIT EVENT (failed to persist):', event)
    }
  }

  /**
   * Registrar login exitoso
   */
  async logLogin(userId: string, userEmail: string, userRole: UserRole, tenantId: string) {
    await this.logEvent({
      user_id: userId,
      user_email: userEmail,
      user_role: userRole,
      tenant_id: tenantId,
      event_type: AuditEventType.AUTH_LOGIN,
      resource_type: ResourceType.USER,
      resource_id: userId,
      action: 'login',
      description: `Usuario ${userEmail} ha iniciado sesión`
    })
  }

  /**
   * Registrar intento de login fallido
   */
  async logFailedLogin(email: string, reason: string, tenantId: string = 'unknown') {
    await this.logEvent({
      user_id: 'anonymous',
      user_email: email,
      tenant_id: tenantId,
      event_type: AuditEventType.AUTH_FAILED_LOGIN,
      resource_type: ResourceType.USER,
      action: 'failed_login',
      description: `Intento de login fallido para ${email}: ${reason}`,
      metadata: { reason }
    })
  }

  /**
   * Registrar logout
   */
  async logLogout(userId: string, userEmail: string, reason: string, tenantId: string) {
    await this.logEvent({
      user_id: userId,
      user_email: userEmail,
      tenant_id: tenantId,
      event_type: AuditEventType.AUTH_LOGOUT,
      resource_type: ResourceType.USER,
      resource_id: userId,
      action: 'logout',
      description: `Usuario ${userEmail} ha cerrado sesión`,
      metadata: { reason }
    })
  }

  /**
   * Registrar despido de empleado
   */
  async logEmployeeFired(
    actionUserId: string,
    actionUserEmail: string,
    firedUserId: string,
    firedUserEmail: string,
    reason: string,
    tenantId: string
  ) {
    await this.logEvent({
      user_id: actionUserId,
      user_email: actionUserEmail,
      tenant_id: tenantId,
      event_type: AuditEventType.EMPLOYEE_FIRED,
      resource_type: ResourceType.EMPLOYEE,
      resource_id: firedUserId,
      action: 'fire_employee',
      description: `${actionUserEmail} ha despedido a ${firedUserEmail}`,
      metadata: { fired_user_email: firedUserEmail, reason }
    })
  }

  /**
   * Registrar contratación de empleado
   */
  async logEmployeeHired(
    actionUserId: string,
    actionUserEmail: string,
    hiredUserId: string,
    hiredUserEmail: string,
    role: UserRole,
    tenantId: string
  ) {
    await this.logEvent({
      user_id: actionUserId,
      user_email: actionUserEmail,
      tenant_id: tenantId,
      event_type: AuditEventType.EMPLOYEE_HIRED,
      resource_type: ResourceType.EMPLOYEE,
      resource_id: hiredUserId,
      action: 'hire_employee',
      description: `${actionUserEmail} ha contratado a ${hiredUserEmail} como ${role}`,
      metadata: { hired_user_email: hiredUserEmail, role }
    })
  }

  /**
   * Registrar cambio de rol de usuario
   */
  async logRoleChange(
    actionUserId: string,
    actionUserEmail: string,
    targetUserId: string,
    targetUserEmail: string,
    oldRole: UserRole,
    newRole: UserRole,
    tenantId: string
  ) {
    await this.logEvent({
      user_id: actionUserId,
      user_email: actionUserEmail,
      tenant_id: tenantId,
      event_type: AuditEventType.USER_ROLE_CHANGED,
      resource_type: ResourceType.USER,
      resource_id: targetUserId,
      action: 'change_role',
      description: `${actionUserEmail} cambió el rol de ${targetUserEmail} de ${oldRole} a ${newRole}`,
      metadata: { target_user_email: targetUserEmail, old_role: oldRole, new_role: newRole }
    })
  }

  /**
   * Registrar eliminación de vehículo
   */
  async logVehicleDeleted(
    userId: string,
    userEmail: string,
    vehicleId: string,
    vehicleInfo: string,
    tenantId: string
  ) {
    await this.logEvent({
      user_id: userId,
      user_email: userEmail,
      tenant_id: tenantId,
      event_type: AuditEventType.VEHICLE_DELETED,
      resource_type: ResourceType.VEHICLE,
      resource_id: vehicleId,
      action: 'delete_vehicle',
      description: `${userEmail} eliminó el vehículo ${vehicleInfo}`,
      metadata: { vehicle_info: vehicleInfo }
    })
  }

  /**
   * Registrar cambio de precio de vehículo
   */
  async logVehiclePriceChange(
    userId: string,
    userEmail: string,
    vehicleId: string,
    vehicleInfo: string,
    oldPrice: number,
    newPrice: number,
    tenantId: string
  ) {
    await this.logEvent({
      user_id: userId,
      user_email: userEmail,
      tenant_id: tenantId,
      event_type: AuditEventType.VEHICLE_PRICE_CHANGED,
      resource_type: ResourceType.VEHICLE,
      resource_id: vehicleId,
      action: 'change_price',
      description: `${userEmail} cambió el precio del vehículo ${vehicleInfo} de $${oldPrice.toLocaleString()} a $${newPrice.toLocaleString()}`,
      metadata: { vehicle_info: vehicleInfo, old_price: oldPrice, new_price: newPrice }
    })
  }

  /**
   * Registrar acceso no autorizado
   */
  async logUnauthorizedAccess(
    userId: string,
    userEmail: string,
    attemptedResource: string,
    requiredPermission: string,
    tenantId: string
  ) {
    await this.logEvent({
      user_id: userId,
      user_email: userEmail,
      tenant_id: tenantId,
      event_type: AuditEventType.UNAUTHORIZED_ACCESS,
      resource_type: ResourceType.USER,
      resource_id: userId,
      action: 'unauthorized_access',
      description: `${userEmail} intentó acceder a ${attemptedResource} sin permisos suficientes`,
      metadata: { attempted_resource: attemptedResource, required_permission: requiredPermission }
    })
  }

  /**
   * Registrar exportación de datos
   */
  async logDataExport(
    userId: string,
    userEmail: string,
    exportType: string,
    recordCount: number,
    tenantId: string
  ) {
    await this.logEvent({
      user_id: userId,
      user_email: userEmail,
      tenant_id: tenantId,
      event_type: AuditEventType.DATA_EXPORT,
      resource_type: ResourceType.REPORT,
      action: 'export_data',
      description: `${userEmail} exportó ${recordCount} registros de ${exportType}`,
      metadata: { export_type: exportType, record_count: recordCount }
    })
  }

  /**
   * Obtener logs de auditoría con filtros
   */
  async getAuditLogs(filters: {
    startDate?: string
    endDate?: string
    userId?: string
    eventType?: AuditEventType
    resourceType?: ResourceType
    tenantId?: string
    limit?: number
    offset?: number
  }): Promise<AuditEvent[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
      }
      
      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }
      
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType)
      }
      
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType)
      }
      
      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }
  }

  /**
   * Determinar si un evento es crítico
   */
  private isCriticalEvent(eventType: AuditEventType): boolean {
    const criticalEvents: AuditEventType[] = [
      AuditEventType.EMPLOYEE_FIRED,
      AuditEventType.USER_ROLE_CHANGED,
      AuditEventType.UNAUTHORIZED_ACCESS,
      AuditEventType.SECURITY_VIOLATION,
      AuditEventType.DATA_EXPORT,
      AuditEventType.BULK_DELETE
    ]
    
    return criticalEvents.includes(eventType)
  }

  /**
   * Obtener IP del usuario
   */
  private async getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }
}

// Exportar instancia singleton
export const auditService = AuditService.getInstance()