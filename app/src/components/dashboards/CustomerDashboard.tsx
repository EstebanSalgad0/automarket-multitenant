import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { customerService } from '../../services/customerService'
import type { VehicleData, CustomerProfile, VehicleSearchFilters } from '../../services/customerService'
import AutoMarketIcon from '../AutoMarketIcon'
import VehicleCatalogEnhanced from '../VehicleCatalogEnhanced'
import CustomerFavorites from '../CustomerFavorites'
import CustomerLeads from '../CustomerLeads'
import CustomerProfileComponent from '../CustomerProfileComponent'

interface CustomerDashboardProps {
  isEmbedded?: boolean
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'favorites' | 'inquiries' | 'profile'>('browse')
  const [loading, setLoading] = useState(true)
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [featuredVehicles, setFeaturedVehicles] = useState<VehicleData[]>([])
  const [searchFilters, setSearchFilters] = useState<VehicleSearchFilters>({})
  const [isSearchActive, setIsSearchActive] = useState(false)
  const { user } = useAuth()

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadInitialData()
    }
  }, [user])

  const loadInitialData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Cargar perfil del cliente
      const profile = await customerService.getCustomerProfile(user.id)
      setCustomerProfile(profile)

      // Cargar vehículos destacados (últimos 12 vehículos)
      const searchResult = await customerService.searchVehicles({}, 1, 12)
      setFeaturedVehicles(searchResult.vehicles)

    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (filters: VehicleSearchFilters) => {
    setSearchFilters(filters)
    setIsSearchActive(true)
    setActiveTab('browse')
  }

  const clearSearch = () => {
    setSearchFilters({})
    setIsSearchActive(false)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
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
            Cargando AutoMarket...
          </p>
        </div>
      </div>
    )
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive 
      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
      : 'transparent',
    color: isActive ? 'white' : '#4facfe',
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

  const quickSearchCardStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '32px',
    color: 'white',
    textAlign: 'center' as const,
    margin: '16px 0'
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
              AutoMarket
            </h1>
            <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
              {customerProfile ? `¡Hola ${customerProfile.first_name}!` : 'Encuentra tu vehículo ideal'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Búsqueda rápida */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar marca, modelo..."
              style={{
                padding: '12px 16px 12px 40px',
                border: '1px solid #e2e8f0',
                borderRadius: '25px',
                fontSize: '14px',
                width: '300px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value
                  if (value.trim()) {
                    handleSearch({ brand: value.trim() })
                  }
                }
              }}
            />
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#718096',
              fontSize: '16px'
            }}>
              🔍
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#718096', marginRight: '8px' }}>
              👤 {user?.email}
            </span>
          </div>
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
          onClick={() => setActiveTab('browse')}
          style={tabStyle(activeTab === 'browse')}
        >
          🚗 Explorar Vehículos
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          style={tabStyle(activeTab === 'favorites')}
        >
          ❤️ Favoritos
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          style={tabStyle(activeTab === 'inquiries')}
        >
          📞 Mis Consultas
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
        {activeTab === 'browse' && (
          <div>
            {!isSearchActive ? (
              <>
                {/* Página de bienvenida y búsqueda */}
                <div style={quickSearchCardStyle}>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 16px 0' }}>
                    🚗 Encuentra tu vehículo ideal
                  </h2>
                  <p style={{ fontSize: '18px', opacity: 0.9, margin: '0 0 32px 0' }}>
                    Explora miles de vehículos de calidad de vendedores certificados
                  </p>
                  
                  {/* Botones de búsqueda rápida */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleSearch({ condition_type: 'new' })}
                      style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        border: '2px solid white', 
                        color: 'white',
                        padding: '12px 24px', 
                        borderRadius: '25px', 
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ✨ Vehículos Nuevos
                    </button>
                    <button
                      onClick={() => handleSearch({ condition_type: 'used' })}
                      style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        border: '2px solid white', 
                        color: 'white',
                        padding: '12px 24px', 
                        borderRadius: '25px', 
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🚙 Vehículos Usados
                    </button>
                    <button
                      onClick={() => handleSearch({ body_type: 'suv' })}
                      style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        border: '2px solid white', 
                        color: 'white',
                        padding: '12px 24px', 
                        borderRadius: '25px', 
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🏔️ SUVs
                    </button>
                  </div>
                </div>

                {/* Vehículos destacados */}
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                      🌟 Vehículos Destacados
                    </h3>
                    <button
                      onClick={() => handleSearch({})}
                      style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Ver Todos
                    </button>
                  </div>

                  {featuredVehicles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <p style={{ color: '#718096', fontSize: '16px' }}>
                        No hay vehículos disponibles en este momento.
                      </p>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '20px'
                    }}>
                      {featuredVehicles.slice(0, 6).map((vehicle) => (
                        <div
                          key={vehicle.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            background: '#fafafa',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                          onClick={() => {
                            // TODO: Implementar navegación a detalle
                            console.log('Navigate to vehicle detail:', vehicle.id)
                          }}
                        >
                          <div style={{ 
                            height: '200px', 
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px',
                            color: 'white',
                            fontSize: '48px'
                          }}>
                            🚗
                          </div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1a202c' }}>
                            {vehicle.brand} {vehicle.model} {vehicle.year}
                          </h4>
                          <p style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#4facfe' }}>
                            ${vehicle.price.toLocaleString('es-CL')}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#718096' }}>
                            <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'Nuevo'}</span>
                            <span>{vehicle.condition_type === 'new' ? 'Nuevo' : 'Usado'}</span>
                          </div>
                          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                customerService.addToFavorites(user?.id || '', vehicle.id)
                              }}
                              style={{
                                background: 'transparent',
                                border: '1px solid #e2e8f0',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ❤️ Favorito
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Abrir modal de contacto
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                border: 'none',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              📞 Contactar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Vista de catálogo con filtros activos
              <VehicleCatalogEnhanced 
                initialFilters={searchFilters}
                onClearSearch={clearSearch}
              />
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <CustomerFavorites customerId={user?.id || ''} />
        )}

        {activeTab === 'inquiries' && (
          <CustomerLeads customerId={user?.id || ''} />
        )}

        {activeTab === 'profile' && (
          <CustomerProfileComponent 
            customerId={user?.id || ''}
            onProfileUpdate={() => loadInitialData()}
          />
        )}
      </div>
    </div>
  )
}

export default CustomerDashboard