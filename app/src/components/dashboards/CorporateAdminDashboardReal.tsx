import React, { useState } from 'react'
import { useCorporateDashboard } from '../../hooks/useDashboardData'
import { useAuth } from '../../hooks/useAuth'
import type { VehicleStats, TeamMemberStats, SalesTrend } from '../../services/dashboardService'

interface CorporateAdminDashboardProps {
  isEmbedded?: boolean
}

const CorporateAdminDashboardReal: React.FC<CorporateAdminDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'trends' | 'team'>('overview')
  const { user } = useAuth()
  const { stats, vehicles, topVehicles, teamStats, salesTrends, loading, refresh } = useCorporateDashboard()

  // Formatear moneda chilena
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

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
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Cargando Dashboard Corporativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header Moderno */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem 0',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                🏢 Dashboard Corporativo
              </h1>
              <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: 0 }}>
                Vista estratégica del negocio · {user?.email}
              </p>
            </div>
            <button 
              onClick={refresh}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              🔄 Actualizar
            </button>
          </div>

          {/* Tabs de navegación */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { key: 'overview', icon: '📊', label: 'Resumen' },
              { key: 'branches', icon: '🏢', label: 'Sucursales' },
              { key: 'trends', icon: '📈', label: 'Tendencias' },
              { key: 'team', icon: '👥', label: 'Equipo' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'branches' | 'trends' | 'team')}
                style={{
                  background: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.1)',
                  color: activeTab === tab.key ? '#667eea' : 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div>
            {/* KPIs Principales - Diseño Mejorado */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1.5rem', 
              marginBottom: '2rem' 
            }}>
              {/* Total Vehículos */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.1 }}>🚗</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Inventario Total</div>
                  <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {stats?.totalVehicles || 0}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {stats?.activeVehicles || 0} activos · {stats?.soldVehicles || 0} vendidos
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.9 }}>
                    📊 {stats?.totalVehicles ? ((stats.activeVehicles / stats.totalVehicles) * 100).toFixed(1) : 0}% disponibles
                  </div>
                </div>
              </div>

              {/* Ingresos del Mes */}
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(240,147,251,0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.1 }}>💰</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Ingresos del Mes</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {formatCurrency(stats?.revenueThisMonth || 0)}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {stats?.soldVehicles || 0} vehículos vendidos
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.9 }}>
                    📈 +12% vs mes anterior
                  </div>
                </div>
              </div>

              {/* Tasa de Conversión */}
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(79,172,254,0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.1 }}>📊</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Tasa de Conversión</div>
                  <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {stats?.conversionRate.toFixed(1) || 0}%
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    Ventas / Inventario
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.9 }}>
                    🎯 Meta: 25%
                  </div>
                </div>
              </div>

              {/* Engagement */}
              <div style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(250,112,154,0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.1 }}>👁️</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Engagement Total</div>
                  <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {stats?.totalViews || 0}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    ❤️ {stats?.totalFavorites || 0} favoritos
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.9 }}>
                    📱 Vistas totales
                  </div>
                </div>
              </div>
            </div>

            {/* Vehículos Más Populares */}
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '2rem', 
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: '#2d3748'
              }}>
                🔥 Top 5 Vehículos Más Populares
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#4a5568' }}>Ranking</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#4a5568' }}>Vehículo</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#4a5568' }}>Precio</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#4a5568' }}>Vistas</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#4a5568' }}>Favoritos</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#4a5568' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topVehicles.slice(0, 5).map((vehicle: VehicleStats, index: number) => (
                      <tr key={vehicle.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{
                            background: index === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                                       index === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)' :
                                       index === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%)' :
                                       '#f7fafc',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '1.25rem',
                            color: index < 3 ? 'white' : '#4a5568'
                          }}>
                            {index + 1}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '0.25rem' }}>
                            {vehicle.make} {vehicle.model}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                            {vehicle.year} · {vehicle.mileage?.toLocaleString() || 0} km
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                          {formatCurrency(vehicle.price)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            👁️ <span style={{ fontWeight: '600' }}>{vehicle.views_count}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            ❤️ <span style={{ fontWeight: '600' }}>{vehicle.favorites_count}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            background: vehicle.status === 'available' ? '#c6f6d5' : 
                                       vehicle.status === 'sold' ? '#fed7d7' : '#feebc8',
                            color: vehicle.status === 'available' ? '#22543d' : 
                                   vehicle.status === 'sold' ? '#742a2a' : '#7c2d12',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {vehicle.status === 'available' ? '✓ Disponible' :
                             vehicle.status === 'sold' ? '✓ Vendido' : '⏳ Reservado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.25rem' }}>
                  {vehicles.length}
                </div>
                <div style={{ color: '#718096', fontSize: '0.875rem' }}>Inventario Activo</div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💵</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.25rem' }}>
                  {formatCurrency(vehicles.reduce((sum: number, v: VehicleStats) => sum + v.price, 0))}
                </div>
                <div style={{ color: '#718096', fontSize: '0.875rem' }}>Valor Total Inventario</div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.25rem' }}>
                  {formatCurrency(vehicles.length > 0 ? vehicles.reduce((sum: number, v: VehicleStats) => sum + v.price, 0) / vehicles.length : 0)}
                </div>
                <div style={{ color: '#718096', fontSize: '0.875rem' }}>Precio Promedio</div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.25rem' }}>
                  {teamStats.length}
                </div>
                <div style={{ color: '#718096', fontSize: '0.875rem' }}>Equipo de Ventas</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Branches (Sucursales) */}
        {activeTab === 'branches' && (
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#2d3748' }}>
              🏢 Gestión de Sucursales
            </h2>
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              color: '#718096' 
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏢</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d3748' }}>
                Módulo en Desarrollo
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Las métricas por sucursal estarán disponibles próximamente
              </p>
              <div style={{ fontSize: '0.875rem', color: '#a0aec0' }}>
                Datos necesarios: branches table con relaciones
              </div>
            </div>
          </div>
        )}

        {/* Tab: Trends (Tendencias) */}
        {activeTab === 'trends' && (
          <div>
            <div style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#2d3748' }}>
                📈 Tendencias de Ventas
              </h2>
              {salesTrends.length > 0 ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '300px', padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>
                    {salesTrends.map((trend: SalesTrend, index: number) => {
                      const maxRevenue = Math.max(...salesTrends.map((t: SalesTrend) => t.revenue))
                      const height = (trend.revenue / maxRevenue) * 100
                      return (
                        <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ 
                            background: 'linear-gradient(to top, #667eea, #764ba2)',
                            height: `${height}%`,
                            minHeight: '20px',
                            borderRadius: '8px 8px 0 0',
                            margin: '0 0.5rem',
                            position: 'relative',
                            transition: 'all 0.3s'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '-30px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: '#2d3748',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              {trend.sales} ventas
                            </div>
                          </div>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#4a5568' }}>
                            {trend.month}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                            {formatCurrency(trend.revenue)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748' }}>
                        {salesTrends.reduce((sum: number, t: SalesTrend) => sum + t.sales, 0)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#718096' }}>Ventas Totales (6 meses)</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748' }}>
                        {formatCurrency(salesTrends.reduce((sum: number, t: SalesTrend) => sum + t.revenue, 0))}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#718096' }}>Ingresos Totales (6 meses)</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748' }}>
                        {(salesTrends.reduce((sum: number, t: SalesTrend) => sum + t.sales, 0) / 6).toFixed(1)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#718096' }}>Promedio Mensual</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                  <p>No hay datos de tendencias disponibles</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Team (Equipo) */}
        {activeTab === 'team' && (
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#2d3748' }}>
              👥 Equipo de Ventas Nacional
            </h2>
            {teamStats.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {teamStats.map((member: TeamMemberStats, index: number) => (
                  <div key={member.id} style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    background: index === 0 ? 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)' :
                               index === 1 ? 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)' :
                               index === 2 ? 'linear-gradient(135deg, #fab1a0 0%, #ff7675 100%)' :
                               '#f7fafc',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {index < 3 && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'white',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '1.25rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                    <div style={{ marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.25rem' }}>
                        {member.full_name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
                        {member.email}
                      </p>
                      <span style={{
                        display: 'inline-block',
                        background: 'white',
                        color: '#667eea',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {member.role === 'corporate_admin' ? '👑 Admin Corporativo' :
                         member.role === 'branch_manager' ? '🏢 Gerente Sucursal' :
                         member.role === 'sales_person' ? '💼 Vendedor' : member.role}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2d3748' }}>
                          {member.vehicles_count}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#718096' }}>Vehículos</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2d3748' }}>
                          {member.sales_count}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#718096' }}>Ventas</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(0,0,0,0.1)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.25rem' }}>
                        Ingresos Generados
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748' }}>
                        {formatCurrency(member.total_revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <p>No hay miembros del equipo registrados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS para animaciones */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default CorporateAdminDashboardReal
