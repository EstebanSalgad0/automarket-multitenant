import { useState } from 'react'
import { auditService, AuditEventType, ResourceType } from '../services/auditService'
import type { AuditEvent } from '../services/auditService'
import { useAuth } from './useAuth'

/**
 * Hook para gestionar logs de auditoría
 */
export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  /**
   * Cargar logs de auditoría con filtros
   */
  const loadLogs = async (filters?: {
    startDate?: string
    endDate?: string
    userId?: string
    eventType?: AuditEventType
    resourceType?: ResourceType
    limit?: number
    offset?: number
  }) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const auditLogs = await auditService.getAuditLogs({
        ...filters,
        tenantId: user.user_metadata?.tenant_id
      })
      
      setLogs(auditLogs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los logs de auditoría')
      console.error('Error loading audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Obtener logs recientes (último día)
   */
  const loadRecentLogs = async (limit = 50) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    await loadLogs({
      startDate: yesterday.toISOString(),
      limit
    })
  }

  /**
   * Obtener logs de un usuario específico
   */
  const loadUserLogs = async (userId: string, limit = 20) => {
    await loadLogs({
      userId,
      limit
    })
  }

  /**
   * Obtener logs de eventos críticos
   */
  const loadCriticalLogs = async (limit = 100) => {
    setLoading(true)
    setError(null)

    try {
      const criticalEventTypes = [
        AuditEventType.EMPLOYEE_FIRED,
        AuditEventType.USER_ROLE_CHANGED,
        AuditEventType.UNAUTHORIZED_ACCESS,
        AuditEventType.SECURITY_VIOLATION,
        AuditEventType.DATA_EXPORT,
        AuditEventType.BULK_DELETE
      ]

      // Hacer múltiples consultas para cada tipo de evento crítico
      const allCriticalLogs: AuditEvent[] = []

      for (const eventType of criticalEventTypes) {
        const logs = await auditService.getAuditLogs({
          eventType,
          tenantId: user?.user_metadata?.tenant_id,
          limit: Math.ceil(limit / criticalEventTypes.length)
        })
        allCriticalLogs.push(...logs)
      }

      // Ordenar por fecha descendente y limitar
      const sortedLogs = allCriticalLogs
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, limit)

      setLogs(sortedLogs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los logs críticos')
      console.error('Error loading critical logs:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filtrar logs por tipo de evento
   */
  const filterByEventType = (eventType: AuditEventType) => {
    return logs.filter(log => log.event_type === eventType)
  }

  /**
   * Filtrar logs por tipo de recurso
   */
  const filterByResourceType = (resourceType: ResourceType) => {
    return logs.filter(log => log.resource_type === resourceType)
  }

  /**
   * Obtener estadísticas de los logs cargados
   */
  const getLogStats = () => {
    const stats = {
      total: logs.length,
      byEventType: {} as Record<string, number>,
      byResourceType: {} as Record<string, number>,
      criticalEvents: 0,
      recentEvents: 0 // últimas 24 horas
    }

    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    logs.forEach(log => {
      // Contar por tipo de evento
      stats.byEventType[log.event_type] = (stats.byEventType[log.event_type] || 0) + 1
      
      // Contar por tipo de recurso
      stats.byResourceType[log.resource_type] = (stats.byResourceType[log.resource_type] || 0) + 1
      
      // Contar eventos críticos
      if (isCriticalEvent(log.event_type)) {
        stats.criticalEvents++
      }
      
      // Contar eventos recientes
      if (log.created_at && new Date(log.created_at) > oneDayAgo) {
        stats.recentEvents++
      }
    })

    return stats
  }

  /**
   * Determinar si un evento es crítico
   */
  const isCriticalEvent = (eventType: AuditEventType): boolean => {
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

  return {
    logs,
    loading,
    error,
    loadLogs,
    loadRecentLogs,
    loadUserLogs,
    loadCriticalLogs,
    filterByEventType,
    filterByResourceType,
    getLogStats,
    isCriticalEvent
  }
}

/**
 * Hook para registrar acciones de auditoría fácilmente desde componentes
 */
export function useAuditLogger() {
  const { user } = useAuth()

  /**
   * Registrar acción de auditoría
   */
  const logAction = async (
    eventType: AuditEventType,
    resourceType: ResourceType,
    action: string,
    description: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return

    try {
      await auditService.logEvent({
        user_id: user.id,
        user_email: user.email || 'unknown',
        user_role: user.user_metadata?.role,
        tenant_id: user.user_metadata?.tenant_id || 'unknown',
        event_type: eventType,
        resource_type: resourceType,
        resource_id: resourceId,
        action,
        description,
        metadata
      })
    } catch (error) {
      console.error('Error logging audit action:', error)
    }
  }

  /**
   * Registrar acceso no autorizado
   */
  const logUnauthorizedAccess = async (
    attemptedResource: string,
    requiredPermission: string
  ) => {
    if (!user) return

    await auditService.logUnauthorizedAccess(
      user.id,
      user.email || 'unknown',
      attemptedResource,
      requiredPermission,
      user.user_metadata?.tenant_id || 'unknown'
    )
  }

  /**
   * Registrar exportación de datos
   */
  const logDataExport = async (
    exportType: string,
    recordCount: number
  ) => {
    if (!user) return

    await auditService.logDataExport(
      user.id,
      user.email || 'unknown',
      exportType,
      recordCount,
      user.user_metadata?.tenant_id || 'unknown'
    )
  }

  return {
    logAction,
    logUnauthorizedAccess,
    logDataExport
  }
}