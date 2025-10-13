import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { customerService } from '../services/customerService'
import type { VehicleData, VehicleSearchFilters } from '../services/customerService'

interface VehicleCatalogProps {
  initialFilters?: VehicleSearchFilters
  onClearSearch?: () => void
  onBack?: () => void
}

const VehicleCatalog: React.FC<VehicleCatalogProps> = ({ 
  initialFilters = {}, 
  onClearSearch,
  onBack 
}) => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<VehicleSearchFilters>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc'>('price_asc')
  const [showFilters, setShowFilters] = useState(false)
  const { user } = useAuth()

  const itemsPerPage = 12

  // Cargar vehículos
  useEffect(() => {
    loadVehicles()
  }, [filters, currentPage, sortBy])

  const loadVehicles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await customerService.searchVehicles(filters, currentPage, itemsPerPage)
      
      // Aplicar ordenamiento local (simulado)
      let sortedVehicles = [...result.vehicles]
      switch (sortBy) {
        case 'price_asc':
          sortedVehicles.sort((a, b) => a.price - b.price)
          break
        case 'price_desc':
          sortedVehicles.sort((a, b) => b.price - a.price)
          break
        case 'year_desc':
          sortedVehicles.sort((a, b) => b.year - a.year)
          break
        case 'mileage_asc':
          sortedVehicles.sort((a, b) => (a.mileage || 0) - (b.mileage || 0))
          break
      }

      setVehicles(sortedVehicles)
      setTotalVehicles(result.total)
      setTotalPages(Math.ceil(result.total / itemsPerPage))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar vehículos')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof VehicleSearchFilters, value: string | number | undefined) => {
    const newFilters = { ...filters }
    if (value === '' || value === undefined) {
      delete newFilters[key]
    } else {
      (newFilters as any)[key] = value
    }
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setFilters({})
    setCurrentPage(1)
    if (onClearSearch) {
      onClearSearch()
    }
  }

  const addToFavorites = async (vehicleId: string) => {
    if (!user) return
    
    try {
      await customerService.addToFavorites(user.id, vehicleId)
      // TODO: Mostrar notificación de éxito
      console.log('Agregado a favoritos')
    } catch (err) {
      console.error('Error al agregar a favoritos:', err)
    }
  }

  const contactSeller = async (vehicleId: string) => {
    if (!user) return
    
    try {
      await customerService.createLead({
        customer_id: user.id,
        vehicle_id: vehicleId,
        customer_name: 'Cliente', // TODO: Obtener nombre real del perfil
        customer_email: user.email || 'cliente@ejemplo.com',
        message: 'Estoy interesado en este vehículo. ¿Podrían contactarme?',
        lead_source: 'catalog'
      })
      // TODO: Mostrar notificación de éxito
      console.log('Consulta enviada')
    } catch (err) {
      console.error('Error al enviar consulta:', err)
    }
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    margin: '16px 0'
  }

  const filterButtonStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    border: isActive ? 'none' : '1px solid #e2e8f0',
    background: isActive 
      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
      : 'white',
    color: isActive ? 'white' : '#4a5568',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    margin: '4px',
    transition: 'all 0.2s ease'
  })

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
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                marginRight: '16px',
                color: '#4facfe'
              }}
            >
              ←
            </button>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a202c' }}>
              🚗 Catálogo de Vehículos
            </h1>
            <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
              {totalVehicles} vehículos disponibles
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Botón mostrar/ocultar filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters 
                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                : 'transparent',
              color: showFilters ? 'white' : '#4facfe',
              border: showFilters ? 'none' : '1px solid #4facfe',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔍 {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="year_desc">Año: Más Reciente</option>
            <option value="mileage_asc">Kilometraje: Menor</option>
          </select>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
              🔍 Filtros de Búsqueda
            </h3>
            <button
              onClick={clearAllFilters}
              style={{
                background: 'transparent',
                color: '#e53e3e',
                border: '1px solid #e53e3e',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Limpiar Todos
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Marca */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568' }}>
                Marca
              </label>
              <input
                type="text"
                placeholder="Ej: Toyota, Ford..."
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Modelo */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568' }}>
                Modelo
              </label>
              <input
                type="text"
                placeholder="Ej: Corolla, Focus..."
                value={filters.model || ''}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Año */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568' }}>
                Año Mínimo
              </label>
              <input
                type="number"
                placeholder="2020"
                min="1990"
                max="2024"
                value={filters.min_year || ''}
                onChange={(e) => handleFilterChange('min_year', e.target.value ? parseInt(e.target.value) : undefined)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Precio Máximo */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#4a5568' }}>
                Precio Máximo
              </label>
              <input
                type="number"
                placeholder="50000000"
                min="0"
                step="1000000"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value ? parseInt(e.target.value) : undefined)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Filtros rápidos */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#4a5568', marginBottom: '12px' }}>
              Filtros Rápidos
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => handleFilterChange('condition_type', filters.condition_type === 'new' ? undefined : 'new')}
                style={filterButtonStyle(filters.condition_type === 'new')}
              >
                ✨ Nuevos
              </button>
              <button
                onClick={() => handleFilterChange('condition_type', filters.condition_type === 'used' ? undefined : 'used')}
                style={filterButtonStyle(filters.condition_type === 'used')}
              >
                🚙 Usados
              </button>
              <button
                onClick={() => handleFilterChange('body_type', filters.body_type === 'suv' ? undefined : 'suv')}
                style={filterButtonStyle(filters.body_type === 'suv')}
              >
                🏔️ SUV
              </button>
              <button
                onClick={() => handleFilterChange('body_type', filters.body_type === 'sedan' ? undefined : 'sedan')}
                style={filterButtonStyle(filters.body_type === 'sedan')}
              >
                🚗 Sedán
              </button>
              <button
                onClick={() => handleFilterChange('body_type', filters.body_type === 'hatchback' ? undefined : 'hatchback')}
                style={filterButtonStyle(filters.body_type === 'hatchback')}
              >
                🚕 Hatchback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div style={{ padding: '32px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '6px solid #e2e8f0',
              borderTop: '6px solid #4facfe',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }}></div>
            <p style={{ color: '#718096', fontSize: '16px' }}>Cargando vehículos...</p>
          </div>
        )}

        {error && (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#e53e3e', fontSize: '18px', marginBottom: '16px' }}>
                ❌ Error al cargar vehículos
              </p>
              <p style={{ color: '#718096', fontSize: '14px', marginBottom: '20px' }}>
                {error}
              </p>
              <button
                onClick={loadVehicles}
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ color: '#718096', fontSize: '18px', marginBottom: '16px' }}>
                🔍 No se encontraron vehículos
              </p>
              <p style={{ color: '#a0aec0', fontSize: '14px', marginBottom: '20px' }}>
                Intenta ajustar los filtros de búsqueda
              </p>
              <button
                onClick={clearAllFilters}
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <>
            {/* Grid de Vehículos */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onClick={() => {
                    // TODO: Abrir modal de detalle
                    console.log('Ver detalle del vehículo:', vehicle.id)
                  }}
                >
                  {/* Imagen del vehículo */}
                  <div style={{ 
                    height: '220px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    color: 'white',
                    fontSize: '64px'
                  }}>
                    🚗
                  </div>

                  {/* Información del vehículo */}
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      color: '#1a202c' 
                    }}>
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '16px', 
                      color: '#718096' 
                    }}>
                      {vehicle.year} • {vehicle.condition_type === 'new' ? 'Nuevo' : 'Usado'}
                    </p>
                    <p style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '28px', 
                      fontWeight: '700', 
                      color: '#4facfe' 
                    }}>
                      ${vehicle.price.toLocaleString('es-CL')}
                    </p>
                  </div>

                  {/* Detalles adicionales */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    fontSize: '14px',
                    color: '#718096',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <strong>Kilometraje:</strong><br />
                      {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'Nuevo'}
                    </div>
                    <div>
                      <strong>Transmisión:</strong><br />
                      {vehicle.transmission || 'No especificada'}
                    </div>
                    <div>
                      <strong>Combustible:</strong><br />
                      {vehicle.fuel_type || 'No especificado'}
                    </div>
                    <div>
                      <strong>Tipo:</strong><br />
                      {vehicle.body_type || 'No especificado'}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToFavorites(vehicle.id)
                      }}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: '2px solid #e2e8f0',
                        color: '#4a5568',
                        padding: '10px 16px',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#4facfe'
                        e.currentTarget.style.color = '#4facfe'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.color = '#4a5568'
                      }}
                    >
                      ❤️ Favorito
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        contactSeller(vehicle.id)
                      }}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      📞 Contactar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '12px',
                marginTop: '40px'
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    background: currentPage === 1 ? '#f7fafc' : 'white',
                    border: '1px solid #e2e8f0',
                    color: currentPage === 1 ? '#a0aec0' : '#4a5568',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  ← Anterior
                </button>

                <span style={{ color: '#718096', fontSize: '14px' }}>
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    background: currentPage === totalPages ? '#f7fafc' : 'white',
                    border: '1px solid #e2e8f0',
                    color: currentPage === totalPages ? '#a0aec0' : '#4a5568',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CSS para la animación de carga */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default VehicleCatalog