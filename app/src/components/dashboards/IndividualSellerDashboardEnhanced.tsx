import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services/dashboardService'
import type { SellerMetrics } from '../../services/dashboardService'
import { supabase } from '../../lib/supabase'
import AutoMarketIcon from '../AutoMarketIcon'

interface IndividualSellerDashboardEnhancedProps {
  isEmbedded?: boolean
}

const IndividualSellerDashboardEnhanced: React.FC<IndividualSellerDashboardEnhancedProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'vehicles' | 'profile'>('overview')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<SellerMetrics | null>(null)
  const [sellerInfo, setSellerInfo] = useState<any>(null)
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

  const loadSellerData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Obtener información del vendedor
      const { data: userData } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, role, branches(name), created_at')
        .eq('id', user.id)
        .single() as { data: any }

      setSellerInfo(userData)

      // Cargar métricas del vendedor
      const sellerMetrics = await dashboardService.getSellerMetrics(user.id)
      setMetrics(sellerMetrics)

    } catch (error) {
      console.error('Error loading seller data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSellerData()
  }, [user])

  if (loading) {
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
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Cargando Mi Dashboard...</p>
        </div>
      </div>
    )
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : 'transparent',
    color: isActive ? 'white' : '#667eea',
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              Mi Dashboard
            </h1>
            <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
              Panel individual - {sellerInfo?.first_name} {sellerInfo?.last_name}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#718096', marginRight: '16px' }}>
            👤 {user?.email}
          </span>
          <button 
            onClick={loadSellerData}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          onClick={() => setActiveTab('leads')}
          style={tabStyle(activeTab === 'leads')}
        >
          📋 Mis Leads
        </button>
        <button 
          onClick={() => setActiveTab('vehicles')}
          style={tabStyle(activeTab === 'vehicles')}
        >
          🚗 Mis Vehículos
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          style={tabStyle(activeTab === 'profile')}
        >
          👤 Mi Perfil
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        {activeTab === 'overview' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              📊 Mi Resumen de Ventas
            </h2>
            
            {/* Métricas principales */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: '32px' }}>
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.myLeads || 0)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Leads Generados</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.myVehiclesList?.length || 0)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Vehículos Publicados</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.mySales || 0)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Ventas Realizadas</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatCurrency(metrics.myRevenue || 0)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Revenue Total</div>
              </div>
            </div>

            {/* Actividad reciente */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                📈 Mi Actividad Reciente
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {(metrics.myLeadsList || []).slice(0, 5).map((lead: any, index: number) => (
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
                        {lead.customer_name}
                      </div>
                      <div style={{ color: '#718096', fontSize: '14px' }}>
                        {lead.customer_email}
                      </div>
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
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              📋 Gestión de Mis Leads
            </h2>
            
            <div style={cardStyle}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {(metrics.myLeadsList || []).map((lead: any) => (
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
                        {lead.message && (
                          <p style={{ color: '#4a5568', margin: '8px 0', fontStyle: 'italic' }}>
                            💬 "{lead.message}"
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
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              🚗 Mis Vehículos Publicados
            </h2>
            
            <div style={cardStyle}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {(metrics.myVehiclesList || []).map((vehicle: any) => (
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
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#667eea' }}>
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
            </div>
          </div>
        )}

        {activeTab === 'profile' && sellerInfo && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              👤 Mi Perfil Personal
            </h2>
            
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: '700',
                  marginRight: '24px'
                }}>
                  {sellerInfo.first_name?.charAt(0)}{sellerInfo.last_name?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                    {sellerInfo.first_name} {sellerInfo.last_name}
                  </h3>
                  <p style={{ color: '#718096', fontSize: '16px', margin: '4px 0' }}>
                    {sellerInfo.role.charAt(0).toUpperCase() + sellerInfo.role.slice(1).replace('_', ' ')}
                  </p>
                  <p style={{ color: '#718096', fontSize: '14px', margin: '4px 0' }}>
                    Miembro desde: {new Date(sellerInfo.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                    📞 Información de Contacto
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div>
                      <strong>Email:</strong> {sellerInfo.email}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {sellerInfo.phone || 'No registrado'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                    🏢 Información Empresarial
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div>
                      <strong>Sucursal:</strong> {sellerInfo.branches?.name || 'Vendedor independiente'}
                    </div>
                    <div>
                      <strong>Rol:</strong> {sellerInfo.role.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {metrics && (
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e1e5e9' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                    📊 Estadísticas de Performance
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f7fafc', borderRadius: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                        {formatNumber(metrics.myLeads || 0)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>Leads Totales</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f7fafc', borderRadius: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                        {formatNumber(metrics.myVehiclesList?.length || 0)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>Vehículos</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f7fafc', borderRadius: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                        {formatNumber(metrics.mySales || 0)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>Ventas</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#f7fafc', borderRadius: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                        {formatCurrency(metrics.myRevenue || 0)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>Revenue</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndividualSellerDashboardEnhanced