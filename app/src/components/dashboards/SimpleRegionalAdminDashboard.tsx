import { useState } from 'react';
import DealerDashboard from './DealerDashboard';

interface BranchStats {
  totalVehicles: number;
  soldVehicles: number;
  totalLeads: number;
  conversionRate: number;
  monthlyRevenue: number;
  activeEmployees: number;
}

// Dashboard regional simplificado - Para funcionalidad completa usar BranchManagerDashboardEnhanced
const SimpleRegionalAdminDashboard = () => {
  const [branchStats] = useState<BranchStats>({
    totalVehicles: 156,
    soldVehicles: 23,
    totalLeads: 89,
    conversionRate: 26.8,
    monthlyRevenue: 145000000,
    activeEmployees: 12
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
        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
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
          <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>Cargando Dashboard Regional...</p>
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
          Dashboard Regional Simplificado
        </h1>
        <p style={{ 
          color: '#718096', 
          margin: '0.5rem 0 0 0',
          fontSize: '1.125rem'
        }}>
          Vista de administración de sucursal
        </p>
        <div style={{
          background: '#f0fff4',
          border: '1px solid #9ae6b4',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '16px',
          color: '#22543d'
        }}>
          <strong>💡 Consejo:</strong> Para funcionalidad completa usa el <strong>"🚀 Dashboard Mejorado"</strong> en el menú principal
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        {/* Métricas principales */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatNumber(branchStats.totalVehicles)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Vehículos Totales</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatNumber(branchStats.soldVehicles)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Vendidos</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatNumber(branchStats.totalLeads)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Leads</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {branchStats.conversionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Conversión</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatCurrency(branchStats.monthlyRevenue)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Revenue Mensual</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {formatNumber(branchStats.activeEmployees)}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Empleados</div>
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

export default SimpleRegionalAdminDashboard;