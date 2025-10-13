import { useState, useEffect } from 'react'
import { useAuditLogs } from '../../hooks/useAudit'
import { usePermissions } from '../../hooks/usePermissions'
import { PermissionGuard } from '../security/PermissionGuards'
import { Permission } from '../../lib/permissions'
import { AuditEventType, ResourceType } from '../../services/auditService'

import './AuditLogs.css'

interface AuditLogsProps {
  userId?: string
  showCriticalOnly?: boolean
  maxLogs?: number
}

export default function AuditLogs({ userId, showCriticalOnly = false, maxLogs = 100 }: AuditLogsProps) {
  const { logs, loading, error, loadLogs, loadCriticalLogs, loadUserLogs, getLogStats, isCriticalEvent } = useAuditLogs()
  const { hasPermission } = usePermissions()
  const [filters, setFilters] = useState({
    eventType: '' as AuditEventType | '',
    resourceType: '' as ResourceType | '',
    startDate: '',
    endDate: '',
    search: ''
  })

  useEffect(() => {
    if (showCriticalOnly) {
      loadCriticalLogs(maxLogs)
    } else if (userId) {
      loadUserLogs(userId, maxLogs)
    } else {
      loadLogs({ limit: maxLogs })
    }
  }, [userId, showCriticalOnly, maxLogs])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const filterParams: any = { limit: maxLogs }
    
    if (filters.eventType) filterParams.eventType = filters.eventType
    if (filters.resourceType) filterParams.resourceType = filters.resourceType
    if (filters.startDate) filterParams.startDate = new Date(filters.startDate).toISOString()
    if (filters.endDate) filterParams.endDate = new Date(filters.endDate).toISOString()
    if (userId) filterParams.userId = userId

    loadLogs(filterParams)
  }

  const clearFilters = () => {
    setFilters({
      eventType: '',
      resourceType: '',
      startDate: '',
      endDate: '',
      search: ''
    })
    if (showCriticalOnly) {
      loadCriticalLogs(maxLogs)
    } else if (userId) {
      loadUserLogs(userId, maxLogs)
    } else {
      loadLogs({ limit: maxLogs })
    }
  }

  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true
    
    const searchTerm = filters.search.toLowerCase()
    return (
      log.description.toLowerCase().includes(searchTerm) ||
      log.user_email?.toLowerCase().includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm) ||
      log.resource_id?.toLowerCase().includes(searchTerm)
    )
  })

  const formatEventType = (eventType: AuditEventType): string => {
    const eventTypeLabels: Record<AuditEventType, string> = {
      'auth_login': 'Inicio de sesión',
      'auth_logout': 'Cierre de sesión',
      'auth_failed_login': 'Login fallido',
      'auth_password_change': 'Cambio de contraseña',
      'user_created': 'Usuario creado',
      'user_updated': 'Usuario actualizado',
      'user_deleted': 'Usuario eliminado',
      'user_role_changed': 'Cambio de rol',
      'user_suspended': 'Usuario suspendido',
      'user_activated': 'Usuario activado',
      'employee_hired': 'Empleado contratado',
      'employee_fired': 'Empleado despedido',
      'employee_promoted': 'Empleado promovido',
      'employee_profile_updated': 'Perfil actualizado',
      'vehicle_created': 'Vehículo creado',
      'vehicle_updated': 'Vehículo actualizado',
      'vehicle_deleted': 'Vehículo eliminado',
      'vehicle_status_changed': 'Estado cambiado',
      'vehicle_price_changed': 'Precio cambiado',
      'lead_created': 'Lead creado',
      'lead_assigned': 'Lead asignado',
      'lead_status_changed': 'Estado de lead',
      'deal_closed': 'Venta cerrada',
      'settings_updated': 'Configuración',
      'role_permissions_changed': 'Permisos cambiados',
      'branch_created': 'Sucursal creada',
      'branch_updated': 'Sucursal actualizada',
      'security_violation': 'Violación de seguridad',
      'unauthorized_access': 'Acceso no autorizado',
      'suspicious_activity': 'Actividad sospechosa',
      'data_export': 'Exportación de datos',
      'data_import': 'Importación de datos',
      'bulk_delete': 'Eliminación masiva'
    }
    return eventTypeLabels[eventType] || eventType
  }

  const formatResourceType = (resourceType: ResourceType): string => {
    const resourceTypeLabels: Record<ResourceType, string> = {
      'user': 'Usuario',
      'employee': 'Empleado',
      'vehicle': 'Vehículo',
      'lead': 'Lead',
      'branch': 'Sucursal',
      'tenant': 'Tenant',
      'setting': 'Configuración',
      'report': 'Reporte'
    }
    return resourceTypeLabels[resourceType] || resourceType
  }

  const getEventIcon = (eventType: AuditEventType): string => {
    if (eventType.startsWith('auth_')) return '🔐'
    if (eventType.includes('user') || eventType.includes('employee')) return '👤'
    if (eventType.includes('vehicle')) return '🚗'
    if (eventType.includes('security') || eventType.includes('unauthorized')) return '⚠️'
    if (eventType.includes('delete') || eventType.includes('fired')) return '🗑️'
    if (eventType.includes('export') || eventType.includes('import')) return '📊'
    return '📝'
  }

  const stats = getLogStats()

  if (!hasPermission(Permission.VIEW_AUDIT_LOGS)) {
    return (
      <div className="audit-logs-container">
        <div className="access-denied">
          <h3>Acceso Denegado</h3>
          <p>No tienes permisos para ver los logs de auditoría.</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard permission={Permission.VIEW_AUDIT_LOGS}>
      <div className="audit-logs-container">
        <div className="audit-logs-header">
          <h2>
            {showCriticalOnly ? 'Eventos Críticos de Auditoría' : 'Logs de Auditoría'}
            {userId && ' - Usuario Específico'}
          </h2>
          
          {/* Estadísticas */}
          <div className="audit-stats">
            <div className="stat-card">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card critical">
              <span className="stat-number">{stats.criticalEvents}</span>
              <span className="stat-label">Críticos</span>
            </div>
            <div className="stat-card recent">
              <span className="stat-number">{stats.recentEvents}</span>
              <span className="stat-label">Recientes (24h)</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="audit-filters">
          <div className="filter-row">
            <select
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los eventos</option>
              <option value={AuditEventType.AUTH_LOGIN}>Inicios de sesión</option>
              <option value={AuditEventType.AUTH_FAILED_LOGIN}>Logins fallidos</option>
              <option value={AuditEventType.EMPLOYEE_FIRED}>Empleados despedidos</option>
              <option value={AuditEventType.USER_ROLE_CHANGED}>Cambios de rol</option>
              <option value={AuditEventType.VEHICLE_DELETED}>Vehículos eliminados</option>
              <option value={AuditEventType.UNAUTHORIZED_ACCESS}>Accesos no autorizados</option>
              <option value={AuditEventType.DATA_EXPORT}>Exportaciones</option>
            </select>

            <select
              value={filters.resourceType}
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los recursos</option>
              <option value={ResourceType.USER}>Usuarios</option>
              <option value={ResourceType.EMPLOYEE}>Empleados</option>
              <option value={ResourceType.VEHICLE}>Vehículos</option>
              <option value={ResourceType.LEAD}>Leads</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-input"
              placeholder="Fecha desde"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-input"
              placeholder="Fecha hasta"
            />
          </div>

          <div className="filter-row">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input search-input"
              placeholder="Buscar en descripción, usuario, acción..."
            />

            <div className="filter-buttons">
              <button onClick={applyFilters} className="btn btn-primary">
                Aplicar Filtros
              </button>
              <button onClick={clearFilters} className="btn btn-secondary">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="audit-logs-content">
          {loading && <div className="loading-spinner">Cargando logs...</div>}
          
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && filteredLogs.length === 0 && (
            <div className="no-logs">
              <p>No se encontraron logs de auditoría con los filtros aplicados.</p>
            </div>
          )}

          {!loading && !error && filteredLogs.length > 0 && (
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Usuario</th>
                    <th>Evento</th>
                    <th>Recurso</th>
                    <th>Descripción</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`log-row ${isCriticalEvent(log.event_type) ? 'critical' : ''}`}
                    >
                      <td className="log-timestamp">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString('es-ES')
                          : 'N/A'}
                      </td>
                      <td className="log-user">
                        <div className="user-info">
                          <span className="user-email">{log.user_email || 'N/A'}</span>
                          {log.user_role && (
                            <span className="user-role">{log.user_role}</span>
                          )}
                        </div>
                      </td>
                      <td className="log-event">
                        <div className="event-info">
                          <span className="event-icon">{getEventIcon(log.event_type)}</span>
                          <span className="event-type">{formatEventType(log.event_type)}</span>
                        </div>
                      </td>
                      <td className="log-resource">
                        <div className="resource-info">
                          <span className="resource-type">{formatResourceType(log.resource_type)}</span>
                          {log.resource_id && (
                            <span className="resource-id">{log.resource_id}</span>
                          )}
                        </div>
                      </td>
                      <td className="log-description">
                        <span className="description-text">{log.description}</span>
                        {log.metadata && (
                          <details className="metadata-details">
                            <summary>Detalles</summary>
                            <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                          </details>
                        )}
                      </td>
                      <td className="log-ip">
                        {log.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  )
}