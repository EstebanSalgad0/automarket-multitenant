import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useUserRole } from '../../hooks/useUserRole'
import CorporateAdminDashboardEnhanced from './CorporateAdminDashboardEnhanced'
import BranchManagerDashboardEnhanced from './BranchManagerDashboardEnhanced'
import IndividualSellerDashboardEnhanced from './IndividualSellerDashboardEnhanced'
import AutomotiveSellerDashboardEnhanced from './AutomotiveSellerDashboardEnhanced'

interface RoleBasedDashboardProps {
  isEmbedded?: boolean
}

const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ isEmbedded = false }) => {
  const { user } = useAuth()
  const { role, loading: roleLoading } = useUserRole()

  // Función para obtener el componente correcto según el rol
  const getDashboardComponent = () => {
    if (!user || !role || roleLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '6px solid rgba(255,255,255,0.3)',
              borderTop: '6px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }}></div>
            <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              Cargando dashboard...
            </p>
          </div>
        </div>
      )
    }

    switch (role) {
      case 'corporate_admin':
        return <CorporateAdminDashboardEnhanced isEmbedded={isEmbedded} />
      
      case 'branch_manager':
        return <BranchManagerDashboardEnhanced isEmbedded={isEmbedded} />
      
      case 'individual_seller':
        return <IndividualSellerDashboardEnhanced isEmbedded={isEmbedded} />
      
      case 'automotive_seller':
        return <AutomotiveSellerDashboardEnhanced isEmbedded={isEmbedded} />
      
      case 'buyer':
        // Para compradores, mostrar una vista diferente o redirigir
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
          }}>
            <div style={{ 
              textAlign: 'center', 
              color: 'white',
              maxWidth: '600px',
              padding: '40px'
            }}>
              <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛒</div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
                ¡Bienvenido Comprador!
              </h1>
              <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
                Tu dashboard de comprador está en desarrollo. 
                Mientras tanto, puedes explorar nuestro catálogo de vehículos.
              </p>
              <button style={{
                background: 'white',
                color: '#48bb78',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                🚗 Ver Catálogo
              </button>
            </div>
          </div>
        )
      
      default:
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
          }}>
            <div style={{ 
              textAlign: 'center', 
              color: 'white',
              maxWidth: '500px',
              padding: '40px'
            }}>
              <div style={{ fontSize: '72px', marginBottom: '24px' }}>⚠️</div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
                Rol no reconocido
              </h1>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
                Tu rol "{role}" no tiene un dashboard asignado. 
                Contacta al administrador del sistema.
              </p>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '16px', 
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                <strong>Usuario:</strong> {user.email}<br />
                <strong>Rol:</strong> {role}
              </div>
            </div>
          </div>
        )
    }
  }

  return getDashboardComponent()
}

export default RoleBasedDashboard