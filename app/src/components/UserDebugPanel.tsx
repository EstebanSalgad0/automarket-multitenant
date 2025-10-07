import { useAuth } from '../hooks/useAuth'
import { useUserRole, getRoleName, getRoleIcon } from '../hooks/useUserRole'
import { useState } from 'react'
import './UserDebugPanel.css'

const UserDebugPanel = () => {
  const { user } = useAuth()
  const { role, fullName, branchId, loading, error } = useUserRole()
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return (
      <button 
        className="debug-toggle-btn" 
        onClick={() => setIsVisible(true)}
        title="Mostrar panel de debug"
      >
        🔍 Debug
      </button>
    )
  }

  if (!user) {
    return (
      <div className="user-debug-panel">
        <div className="debug-header">
          <h3>🔍 Panel de Debug - Usuario</h3>
          <button className="debug-close-btn" onClick={() => setIsVisible(false)}>✕</button>
        </div>
        <p>No hay usuario logueado</p>
      </div>
    )
  }

  return (
    <div className="user-debug-panel">
      <div className="debug-header">
        <h3>🔍 Panel de Debug - Usuario</h3>
        <button className="debug-close-btn" onClick={() => setIsVisible(false)} title="Cerrar panel">
          ✕
        </button>
      </div>
      
      <div className="debug-section">
        <h4>📧 Información de Autenticación</h4>
        <div className="debug-info">
          <span className="debug-label">Email:</span>
          <span className="debug-value">{user.email}</span>
        </div>
        <div className="debug-info">
          <span className="debug-label">ID:</span>
          <span className="debug-value">{user.id}</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>👤 Información de Perfil</h4>
        {loading ? (
          <p>Cargando información del perfil...</p>
        ) : error ? (
          <div className="debug-error">
            <p>❌ Error al cargar el perfil:</p>
            <p>{error.message}</p>
            <p className="debug-hint">
              💡 <strong>Solución:</strong> Asegúrate de que:
              <ul>
                <li>La tabla 'users' existe en Supabase</li>
                <li>Tienes un registro en la tabla 'users' con tu ID</li>
                <li>La columna 'role' existe en la tabla</li>
              </ul>
            </p>
          </div>
        ) : (
          <>
            <div className="debug-info">
              <span className="debug-label">Nombre completo:</span>
              <span className="debug-value">{fullName || 'No configurado'}</span>
            </div>
            <div className="debug-info">
              <span className="debug-label">Rol:</span>
              <span className="debug-value">
                {role ? (
                  <>
                    {getRoleIcon(role)} {getRoleName(role)} ({role})
                  </>
                ) : (
                  '❌ No asignado'
                )}
              </span>
            </div>
            <div className="debug-info">
              <span className="debug-label">Sucursal ID:</span>
              <span className="debug-value">{branchId || 'Sin sucursal'}</span>
            </div>

            {!role && (
              <div className="debug-warning">
                <p>⚠️ <strong>No tienes un rol asignado</strong></p>
                <p>Para asignar un rol, ejecuta este SQL en Supabase:</p>
                <pre className="debug-sql">
{`-- Actualizar tu usuario con un rol
UPDATE users 
SET role = 'corporate_admin', 
    full_name = 'Tu Nombre'
WHERE id = '${user.id}';`}
                </pre>
                <p>Opciones de rol disponibles:</p>
                <ul>
                  <li>👔 <code>corporate_admin</code> - Administrador Corporativo</li>
                  <li>🏢 <code>branch_manager</code> - Encargado de Sucursal</li>
                  <li>💼 <code>sales_person</code> - Vendedor de Automotora</li>
                  <li>🛒 <code>buyer</code> - Comprador</li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UserDebugPanel
