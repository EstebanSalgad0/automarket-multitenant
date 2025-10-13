import { useState } from 'react';
import DealerDashboard from './DealerDashboard';

interface CorporateStats {
  totalTenants: number;
  totalVehicles: number;
  totalUsers: number;
  totalRevenue: number;
  monthlySales: number;
  activeRegions: number;
}

// Dashboard corporativo simplificado - Para funcionalidad completa usar CorporateAdminDashboardEnhanced
const SimpleCorporateAdminDashboard = () => {
  const [corporateStats] = useState<CorporateStats>({
    totalTenants: 4,
    totalVehicles: 1253,
    totalUsers: 89,
    totalRevenue: 1850000000,
    monthlySales: 187,
    activeRegions: 5
  });
  
  const [isLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CL').format(num);
  };

  if (isLoading) {
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
            width: '50px', 
            height: '50px', 
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>Cargando Dashboard Corporativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem 2rem', 
        borderBottom: '1px solid #e1e5e9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#1a202c', 
          margin: 0 
        }}>
          Dashboard Corporativo Simplificado
        </h1>
        <p style={{ 
          color: '#718096', 
          margin: '0.5rem 0 0 0',
          fontSize: '1.125rem'
        }}>
          Vista general del sistema multi-tenant
        </p>
        <div style={{
          background: '#fef5e7',
          border: '1px solid #f6ad55',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '16px',
          color: '#744210'
        }}>
          <strong>💡 Consejo:</strong> Para funcionalidad completa usa el <strong>"🚀 Dashboard Mejorado"</strong> en el menú principal
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        {/* Métricas principales */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatNumber(corporateStats.totalTenants)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Tenants Activos</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatNumber(corporateStats.totalVehicles)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Vehículos Totales</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatNumber(corporateStats.totalUsers)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Usuarios Sistema</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatCurrency(corporateStats.totalRevenue)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Revenue Total</div>
          </div>
        </div>

        {/* Dashboard Dealer integrado */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1a202c', 
            marginBottom: '1rem' 
          }}>
            Vista de Concesionario
          </h2>
          <DealerDashboard />
        </div>
      </div>
    </div>
  );
};

export default SimpleCorporateAdminDashboard;