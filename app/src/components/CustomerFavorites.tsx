import React, { useState, useEffect } from 'react'
import { customerService } from '../services/customerService'
import type { VehicleData } from '../services/customerService'

interface CustomerFavoritesProps {
  customerId: string
}

const CustomerFavorites: React.FC<CustomerFavoritesProps> = ({ customerId }) => {
  const [favorites, setFavorites] = useState<VehicleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (customerId) {
      loadFavorites()
    }
  }, [customerId])

  const loadFavorites = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const favoriteVehicles = await customerService.getFavorites(customerId)
      setFavorites(favoriteVehicles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar favoritos')
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (vehicleId: string) => {
    try {
      await customerService.removeFromFavorites(customerId, vehicleId)
      setFavorites(favorites.filter(vehicle => vehicle.id !== vehicleId))
    } catch (err) {
      console.error('Error al eliminar de favoritos:', err)
      // TODO: Mostrar notificación de error
    }
  }

  const contactSeller = async (vehicleId: string, vehicleInfo: string) => {
    try {
      await customerService.createLead({
        customer_id: customerId,
        vehicle_id: vehicleId,
        customer_name: 'Cliente', // TODO: Obtener nombre real del perfil
        customer_email: 'cliente@ejemplo.com', // TODO: Obtener email real del perfil
        message: `Estoy interesado en el vehículo ${vehicleInfo} que tengo en favoritos. ¿Podrían contactarme?`,
        lead_source: 'favorites'
      })
      // TODO: Mostrar notificación de éxito
      console.log('Consulta enviada desde favoritos')
    } catch (err) {
      console.error('Error al enviar consulta:', err)
      // TODO: Mostrar notificación de error
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

  if (loading) {
    return (
      <div style={cardStyle}>
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
          <p style={{ color: '#718096', fontSize: '16px' }}>
            Cargando tus favoritos...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#e53e3e', fontSize: '18px', marginBottom: '16px' }}>
            ❌ Error al cargar favoritos
          </p>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </p>
          <button
            onClick={loadFavorites}
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
    )
  }

  return (
    <div>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
              ❤️ Mis Vehículos Favoritos
            </h3>
            <p style={{ color: '#718096', fontSize: '16px', margin: '8px 0 0 0' }}>
              {favorites.length} vehículo{favorites.length !== 1 ? 's' : ''} en favoritos
            </p>
          </div>
          
          {favorites.length > 0 && (
            <button
              onClick={loadFavorites}
              style={{
                background: 'transparent',
                color: '#4facfe',
                border: '1px solid #4facfe',
                padding: '10px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              🔄 Actualizar
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💔</div>
            <h4 style={{ color: '#4a5568', fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
              No tienes vehículos favoritos
            </h4>
            <p style={{ color: '#718096', fontSize: '16px', marginBottom: '24px' }}>
              Explora el catálogo y marca como favoritos los vehículos que más te interesen
            </p>
            <p style={{ color: '#a0aec0', fontSize: '14px' }}>
              💡 Consejo: Los favoritos te ayudan a comparar vehículos y encontrar las mejores opciones
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {favorites.map((vehicle) => (
              <div
                key={vehicle.id}
                style={{
                  background: '#fafafa',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Botón para eliminar de favoritos */}
                <button
                  onClick={() => removeFromFavorites(vehicle.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fee2e2'
                    e.currentTarget.style.color = '#dc2626'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                    e.currentTarget.style.color = 'inherit'
                  }}
                  title="Eliminar de favoritos"
                >
                  💔
                </button>

                {/* Imagen del vehículo */}
                <div style={{ 
                  height: '200px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: 'white',
                  fontSize: '56px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // TODO: Abrir modal de detalle
                  console.log('Ver detalle del vehículo favorito:', vehicle.id)
                }}
                >
                  🚗
                </div>

                {/* Información del vehículo */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#1a202c' 
                  }}>
                    {vehicle.brand} {vehicle.model}
                  </h4>
                  <p style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '14px', 
                    color: '#718096' 
                  }}>
                    {vehicle.year} • {vehicle.condition_type === 'new' ? 'Nuevo' : 'Usado'}
                  </p>
                  <p style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#4facfe' 
                  }}>
                    ${vehicle.price.toLocaleString('es-CL')}
                  </p>
                </div>

                {/* Detalles rápidos */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#718096',
                  marginBottom: '20px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: '#4a5568' }}>
                      {vehicle.mileage ? `${vehicle.mileage.toLocaleString()}` : '0'} km
                    </div>
                    <div>Kilometraje</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: '#4a5568' }}>
                      {vehicle.transmission || 'N/A'}
                    </div>
                    <div>Transmisión</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: '#4a5568' }}>
                      {vehicle.fuel_type || 'N/A'}
                    </div>
                    <div>Combustible</div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      // TODO: Abrir modal de detalle
                      console.log('Ver detalle completo:', vehicle.id)
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
                    👁️ Ver Detalle
                  </button>
                  <button
                    onClick={() => contactSeller(vehicle.id, `${vehicle.brand} ${vehicle.model} ${vehicle.year}`)}
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

                {/* Indicador de favorito */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ❤️ Favorito
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consejos y acciones adicionales */}
      {favorites.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
            💡 Consejos para tus favoritos
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ 
              background: '#f7fafc', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>
                Compara precios
              </h5>
              <p style={{ fontSize: '12px', color: '#718096', margin: 0 }}>
                Revisa regularmente tus favoritos para ver cambios de precio
              </p>
            </div>
            <div style={{ 
              background: '#f7fafc', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏰</div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>
                Actúa rápido
              </h5>
              <p style={{ fontSize: '12px', color: '#718096', margin: 0 }}>
                Los vehículos populares se venden rápidamente
              </p>
            </div>
            <div style={{ 
              background: '#f7fafc', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📞</div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>
                Contacta al vendedor
              </h5>
              <p style={{ fontSize: '12px', color: '#718096', margin: 0 }}>
                Haz preguntas específicas y agenda una visita
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CSS para animaciones */}
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

export default CustomerFavorites