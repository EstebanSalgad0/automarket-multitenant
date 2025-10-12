import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services/dashboardService'
import type { BranchManagerMetrics } from '../../services/dashboardService'
import { supabase } from '../../lib/supabase'
import AutoMarketIcon from '../AutoMarketIcon'

interface BranchManagerDashboardEnhancedProps {
  isEmbedded?: boolean
}

const BranchManagerDashboardEnhanced: React.FC<BranchManagerDashboardEnhancedProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'vehicles' | 'leads' | 'performance'>('overview')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<BranchManagerMetrics | null>(null)
  const [branchInfo, setBranchInfo] = useState<any>(null)
  const { user } = useAuth()

  // Formatear moneda chilena
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CL').format(num)
  }

  const loadBranchData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Obtener branch_id del usuario actual
      const { data: userData } = await supabase
        .from('users')
        .select('branch_id, branches!inner(id, name, address, phone, email)')
        .eq('id', user.id)
        .single() as { data: any }

      if (!userData?.branch_id) {
        console.error('Usuario no tiene branch_id asignado')
        return
      }

      setBranchInfo(userData.branches)

      // Cargar métricas de la sucursal
      const branchMetrics = await dashboardService.getBranchManagerMetrics(userData.branch_id)
      setMetrics(branchMetrics)

    } catch (error) {
      console.error('Error loading branch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranchData()
  }, [user])

  if (loading) {
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
            width: '60px', 
            height: '60px', 
            border: '6px solid rgba(255,255,255,0.3)',
            borderTop: '6px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }}></div>
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Cargando Dashboard Sucursal...</p>
        </div>
      </div>
    )
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive 
      ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' 
      : 'transparent',
    color: isActive ? 'white' : '#48bb78',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    margin: '0 8px',
    transition: 'all 0.3s ease',
    borderWidth: isActive ? '0' : '2px',
    borderStyle: isActive ? 'none' : 'solid',
    borderColor: isActive ? 'transparent' : '#e1e5e9'
  })

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    margin: '16px 0'
  }

  const metricCardStyle = {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    textAlign: 'center' as const,
    minWidth: '200px',
    margin: '8px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '20px 32px', 
        borderBottom: '1px solid #e1e5e9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AutoMarketIcon size={40} />
          <div style={{ marginLeft: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a202c' }}>
              Dashboard Sucursal
            </h1>
            <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
              {branchInfo?.name || 'Mi Sucursal'} - Gestión y control
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#718096', marginRight: '16px' }}>
            👤 {user?.email}
          </span>
          <button 
            onClick={loadBranchData}
            style={{
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        background: 'white', 
        padding: '16px 32px', 
        borderBottom: '1px solid #e1e5e9',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={tabStyle(activeTab === 'overview')}
        >
          📊 Resumen
        </button>
        <button 
          onClick={() => setActiveTab('employees')}
          style={tabStyle(activeTab === 'employees')}
        >
          👥 Mi Equipo
        </button>
        <button 
          onClick={() => setActiveTab('vehicles')}
          style={tabStyle(activeTab === 'vehicles')}
        >
          🚗 Inventario
        </button>
        <button 
          onClick={() => setActiveTab('leads')}
          style={tabStyle(activeTab === 'leads')}
        >
          📋 Leads
        </button>
        <button 
          onClick={() => setActiveTab('performance')}
          style={tabStyle(activeTab === 'performance')}
        >
          📈 Performance
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        {activeTab === 'overview' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              📊 Resumen de Sucursal
            </h2>
            
            {/* Información de la sucursal */}
            {branchInfo && (
              <div style={{ ...cardStyle, marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                  🏢 Información de Sucursal
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <strong>Nombre:</strong> {branchInfo.name}
                  </div>
                  <div>
                    <strong>Dirección:</strong> {branchInfo.address}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {branchInfo.phone}
                  </div>
                  <div>
                    <strong>Email:</strong> {branchInfo.email}
                  </div>
                </div>
              </div>
            )}
            
            {/* Métricas principales */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: '32px' }}>
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.branchEmployees)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Empleados</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.branchVehiclesCount)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Vehículos</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.branchLeadsCount)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Leads</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatCurrency(metrics.branchRevenue)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Revenue Total</div>
              </div>
            </div>

            {/* Performance del equipo */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                🌟 Performance del Equipo
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {metrics.salesByEmployee.map((employee, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    background: '#f7fafc',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>
                        {employee.employee_name}
                      </div>
                      <div style={{ color: '#718096', fontSize: '14px' }}>
                        {employee.sales_count} ventas realizadas
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: '#48bb78', fontSize: '18px' }}>
                        {formatCurrency(employee.revenue)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>
                        Revenue generado
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              👥 Gestión del Equipo
            </h2>
            
            <div style={cardStyle}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {metrics.employees.map((employee) => (
                  <div key={employee.id} style={{
                    padding: '20px',
                    border: '1px solid #e1e5e9',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <p style={{ color: '#718096', margin: '4px 0' }}>✉️ {employee.email}</p>
                      <p style={{ color: '#718096', margin: '4px 0' }}>📞 {employee.phone || 'N/A'}</p>
                      <span style={{
                        background: employee.role === 'branch_manager' ? '#48bb78' : '#ed8936',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {employee.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: '#718096' }}>
                        Desde: {new Date(employee.created_at).toLocaleDateString('es-CL')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              🚗 Inventario de Vehículos
            </h2>
            
            <div style={cardStyle}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {metrics.vehiclesList.slice(0, 10).map((vehicle) => (
                  <div key={vehicle.id} style={{
                    padding: '20px',
                    border: '1px solid #e1e5e9',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </h4>
                      <p style={{ color: '#718096', margin: '4px 0' }}>
                        {vehicle.mileage ? `${formatNumber(vehicle.mileage)} km` : 'N/A'} • {vehicle.condition_type}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#718096' }}>
                          👁️ {vehicle.views_count} vistas
                        </span>
                        <span style={{ fontSize: '14px', color: '#718096' }}>
                          ❤️ {vehicle.favorites_count} favoritos
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#48bb78' }}>
                        {formatCurrency(vehicle.price)}
                      </div>
                      <span style={{
                        background: vehicle.status === 'available' ? '#48bb78' : 
                                   vehicle.status === 'sold' ? '#667eea' : '#ed8936',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {vehicle.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {metrics.vehiclesList.length > 10 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}>
                    Ver todos ({metrics.vehiclesList.length} vehículos)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leads' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              📋 Gestión de Leads
            </h2>
            
            <div style={cardStyle}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {metrics.leadsList.slice(0, 10).map((lead) => (
                  <div key={lead.id} style={{
                    padding: '20px',
                    border: '1px solid #e1e5e9',
                    borderRadius: '12px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
                          {lead.customer_name}
                        </h4>
                        <p style={{ color: '#718096', margin: '4px 0' }}>✉️ {lead.customer_email}</p>
                        <p style={{ color: '#718096', margin: '4px 0' }}>📞 {lead.customer_phone}</p>
                        {lead.vehicle && (
                          <p style={{ color: '#718096', margin: '4px 0' }}>
                            🚗 {lead.vehicle.make} {lead.vehicle.model} - {formatCurrency(lead.vehicle.price)}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          background: lead.status === 'new' ? '#ed8936' : 
                                     lead.status === 'contacted' ? '#667eea' : '#48bb78',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {lead.status.toUpperCase()}
                        </span>
                        <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                          {new Date(lead.created_at).toLocaleDateString('es-CL')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {metrics.leadsList.length > 10 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}>
                    Ver todos ({metrics.leadsList.length} leads)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              📈 Análisis de Performance
            </h2>
            <div style={cardStyle}>
              <p style={{ textAlign: 'center', color: '#718096', fontSize: '16px', padding: '40px' }}>
                Análisis avanzado de performance en desarrollo...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BranchManagerDashboardEnhanced