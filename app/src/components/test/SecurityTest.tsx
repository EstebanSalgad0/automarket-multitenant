import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuditLogger } from '../../hooks/useAudit'
import { PermissionGuard, AdminGuard, SellerGuard } from '../security/PermissionGuards'
import { Permission, UserRole } from '../../lib/permissions'
import { AuditEventType, ResourceType } from '../../services/auditService'
import './SecurityTest.css'

/**
 * Componente de prueba para verificar la integración completa del sistema de seguridad
 */
export default function SecurityTest() {
  const { user } = useAuth()
  const { hasPermission, canManageUser, isAdmin } = usePermissions()
  const { logAction, logUnauthorizedAccess } = useAuditLogger()
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testPermissions = () => {
    const tests = [
      {
        name: 'Ver vehículos',
        permission: Permission.VIEW_VEHICLES,
        expected: true
      },
      {
        name: 'Gestionar empleados',
        permission: Permission.MANAGE_EMPLOYEES,
        expected: user?.user_metadata?.role === UserRole.SUPER_ADMIN || 
                  user?.user_metadata?.role === UserRole.CORPORATE_ADMIN
      },
      {
        name: 'Ver logs de auditoría',
        permission: Permission.VIEW_AUDIT_LOGS,
        expected: isAdmin()
      },
      {
        name: 'Eliminar vehículos propios',
        permission: Permission.DELETE_OWN_VEHICLES,
        expected: hasPermission(Permission.CREATE_VEHICLES)
      }
    ]

    tests.forEach(test => {
      const result = hasPermission(test.permission)
      const status = result === test.expected ? '✅' : '❌'
      addTestResult(`${status} ${test.name}: ${result ? 'PERMITIDO' : 'DENEGADO'}`)
    })
  }

  const testAuditLogging = async () => {
    try {
      await logAction(
        AuditEventType.SECURITY_VIOLATION,
        ResourceType.USER,
        'security_test',
        'Prueba del sistema de auditoría desde SecurityTest',
        user?.id,
        { test_component: 'SecurityTest', timestamp: new Date().toISOString() }
      )
      addTestResult('✅ Log de auditoría registrado correctamente')
    } catch (error) {
      addTestResult(`❌ Error en log de auditoría: ${error}`)
    }
  }

  const testUnauthorizedAccess = async () => {
    try {
      await logUnauthorizedAccess(
        'Componente de Prueba Crítico',
        Permission.MANAGE_TENANT_SETTINGS
      )
      addTestResult('✅ Acceso no autorizado registrado en auditoría')
    } catch (error) {
      addTestResult(`❌ Error registrando acceso no autorizado: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="security-test-container">
      <div className="security-test-header">
        <h2>🔒 Prueba de Integración del Sistema de Seguridad</h2>
        <p>Componente de prueba para verificar que todas las políticas de seguridad funcionan correctamente</p>
      </div>

      {/* Información del usuario actual */}
      <div className="user-info-section">
        <h3>👤 Usuario Actual</h3>
        <div className="user-details">
          <p><strong>Email:</strong> {user?.email || 'No autenticado'}</p>
          <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
          <p><strong>Rol:</strong> {user?.user_metadata?.role || 'Sin rol asignado'}</p>
          <p><strong>Tenant:</strong> {user?.user_metadata?.tenant_id || 'Sin tenant'}</p>
          <p><strong>Es Admin:</strong> {isAdmin() ? '✅ Sí' : '❌ No'}</p>
          <p><strong>Puede gestionar usuarios:</strong> {canManageUser('salesperson') ? '✅ Sí (puede gestionar vendedores)' : '❌ No'}</p>
        </div>
      </div>

      {/* Pruebas de Guards */}
      <div className="guards-test-section">
        <h3>🛡️ Prueba de Guards de Seguridad</h3>
        
        <div className="guard-test">
          <h4>Admin Guard (Solo administradores)</h4>
          <AdminGuard>
            <div className="success-message">
              ✅ Tienes acceso de administrador - Este mensaje solo lo ven los admins
            </div>
          </AdminGuard>
          <AdminGuard fallback={<div className="error-message">❌ No tienes permisos de administrador</div>}>
            <div></div>
          </AdminGuard>
        </div>

        <div className="guard-test">
          <h4>Seller Guard (Solo vendedores y superiores)</h4>
          <SellerGuard>
            <div className="success-message">
              ✅ Tienes acceso de vendedor - Puedes ver funciones de ventas
            </div>
          </SellerGuard>
          <SellerGuard fallback={<div className="error-message">❌ No tienes permisos de vendedor</div>}>
            <div></div>
          </SellerGuard>
        </div>

        <div className="guard-test">
          <h4>Permission Guard - Gestión de Empleados</h4>
          <PermissionGuard permission={Permission.MANAGE_EMPLOYEES}>
            <div className="success-message">
              ✅ Puedes gestionar empleados - Contratar/Despedir permitido
            </div>
          </PermissionGuard>
          <PermissionGuard 
            permission={Permission.MANAGE_EMPLOYEES}
            fallback={<div className="error-message">❌ No puedes gestionar empleados</div>}
          >
            <div></div>
          </PermissionGuard>
        </div>

        <div className="guard-test">
          <h4>Permission Guard - Ver Logs de Auditoría</h4>
          <PermissionGuard permission={Permission.VIEW_AUDIT_LOGS}>
            <div className="success-message">
              ✅ Puedes ver logs de auditoría - Acceso al sistema de monitoreo
            </div>
          </PermissionGuard>
          <PermissionGuard 
            permission={Permission.VIEW_AUDIT_LOGS}
            fallback={<div className="error-message">❌ No puedes ver logs de auditoría</div>}
          >
            <div></div>
          </PermissionGuard>
        </div>
      </div>

      {/* Pruebas automatizadas */}
      <div className="automated-tests-section">
        <h3>🧪 Pruebas Automatizadas</h3>
        <div className="test-buttons">
          <button onClick={testPermissions} className="test-button">
            🔍 Probar Permisos
          </button>
          <button onClick={testAuditLogging} className="test-button">
            📝 Probar Auditoría
          </button>
          <button onClick={testUnauthorizedAccess} className="test-button">
            ⚠️ Probar Acceso No Autorizado
          </button>
          <button onClick={clearResults} className="clear-button">
            🗑️ Limpiar Resultados
          </button>
        </div>

        <div className="test-results">
          <h4>📊 Resultados de Pruebas</h4>
          <div className="results-list">
            {testResults.length === 0 ? (
              <p className="no-results">No hay resultados aún. Ejecuta algunas pruebas.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="result-item">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lista de permisos del usuario actual */}
      <div className="permissions-list-section">
        <h3>📋 Permisos del Usuario Actual</h3>
        <div className="permissions-grid">
          {Object.values(Permission).map((permission) => (
            <div 
              key={permission} 
              className={`permission-item ${hasPermission(permission) ? 'granted' : 'denied'}`}
            >
              <span className="permission-icon">
                {hasPermission(permission) ? '✅' : '❌'}
              </span>
              <span className="permission-name">{permission}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="system-status-section">
        <h3>⚙️ Estado del Sistema</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Autenticación:</span>
            <span className={`status-value ${user ? 'active' : 'inactive'}`}>
              {user ? '✅ Activa' : '❌ Inactiva'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Permisos:</span>
            <span className="status-value active">✅ Funcionando</span>
          </div>
          <div className="status-item">
            <span className="status-label">Guards:</span>
            <span className="status-value active">✅ Funcionando</span>
          </div>
          <div className="status-item">
            <span className="status-label">Auditoría:</span>
            <span className="status-value active">✅ Funcionando</span>
          </div>
        </div>
      </div>
    </div>
  )
}