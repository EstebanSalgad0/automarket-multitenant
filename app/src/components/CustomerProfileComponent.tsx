import React, { useState, useEffect } from 'react'
import { customerService } from '../services/customerService'
import type { CustomerProfile as CustomerProfileType } from '../services/customerService'

interface CustomerProfileProps {
  customerId: string
  onProfileUpdate?: () => void
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId, onProfileUpdate }) => {
  const [profile, setProfile] = useState<CustomerProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<CustomerProfileType>>({})

  useEffect(() => {
    if (customerId) {
      loadProfile()
    }
  }, [customerId])

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const customerProfile = await customerService.getCustomerProfile(customerId)
      setProfile(customerProfile)
      setEditForm(customerProfile || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editForm.first_name || !editForm.last_name || !editForm.email) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      const updatedProfile = await customerService.updateCustomerProfile(customerId, editForm)
      setProfile(updatedProfile)
      setIsEditing(false)
      
      if (onProfileUpdate) {
        onProfileUpdate()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm(profile || {})
    setIsEditing(false)
    setError(null)
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    margin: '16px 0'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white'
  }

  const labelStyle = {
    display: 'block' as const,
    marginBottom: '8px',
    fontWeight: '500' as const,
    color: '#4a5568',
    fontSize: '14px'
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
            Cargando tu perfil...
          </p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#e53e3e', fontSize: '18px', marginBottom: '16px' }}>
            ❌ Error al cargar perfil
          </p>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </p>
          <button
            onClick={loadProfile}
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
              👤 Mi Perfil
            </h3>
            <p style={{ color: '#718096', fontSize: '16px', margin: '8px 0 0 0' }}>
              Gestiona tu información personal y preferencias
            </p>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              ✏️ Editar Perfil
            </button>
          )}
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {!isEditing ? (
          // Vista de solo lectura
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Información Personal */}
              <div style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                  👤 Información Personal
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>
                      NOMBRE COMPLETO
                    </label>
                    <p style={{ fontSize: '16px', color: '#1a202c', fontWeight: '500', margin: '4px 0 0 0' }}>
                      {profile?.first_name} {profile?.last_name}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>
                      EMAIL
                    </label>
                    <p style={{ fontSize: '14px', color: '#4a5568', margin: '4px 0 0 0' }}>
                      {profile?.email}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>
                      TELÉFONO
                    </label>
                    <p style={{ fontSize: '14px', color: '#4a5568', margin: '4px 0 0 0' }}>
                      {profile?.phone || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                  📍 Ubicación
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>
                      CIUDAD
                    </label>
                    <p style={{ fontSize: '14px', color: '#4a5568', margin: '4px 0 0 0' }}>
                      {profile?.city || 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>
                      REGIÓN
                    </label>
                    <p style={{ fontSize: '14px', color: '#4a5568', margin: '4px 0 0 0' }}>
                      {profile?.region || 'No especificada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferencias de Vehículos */}
            <div style={{
              background: '#f0f9ff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1', marginBottom: '16px' }}>
                🚗 Preferencias de Vehículos
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
                    RANGO DE PRECIO
                  </label>
                  <p style={{ fontSize: '14px', color: '#1e40af', margin: '4px 0 0 0' }}>
                    {profile?.preferred_price_min && profile?.preferred_price_max 
                      ? `$${profile.preferred_price_min.toLocaleString()} - $${profile.preferred_price_max.toLocaleString()}`
                      : 'No especificado'
                    }
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
                    MARCAS PREFERIDAS
                  </label>
                  <p style={{ fontSize: '14px', color: '#1e40af', margin: '4px 0 0 0' }}>
                    {profile?.preferred_brands?.join(', ') || 'No especificadas'}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
                    TIPO DE VEHÍCULO
                  </label>
                  <p style={{ fontSize: '14px', color: '#1e40af', margin: '4px 0 0 0' }}>
                    {profile?.preferred_body_types?.join(', ') || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas de Actividad */}
            <div style={{
              background: '#fef3cd',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #f6e05e'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#b45309', marginBottom: '16px' }}>
                📊 Tu Actividad
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#b45309' }}>
                    {/* TODO: Obtener estadísticas reales */}
                    0
                  </div>
                  <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>
                    Vehículos Favoritos
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#b45309' }}>
                    0
                  </div>
                  <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>
                    Consultas Realizadas
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#b45309' }}>
                    {profile?.created_at ? 
                      Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
                      : 0
                    }
                  </div>
                  <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>
                    Días como Cliente
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Formulario de edición
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Información Personal */}
              <div style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                  👤 Información Personal
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input
                      type="text"
                      value={editForm.first_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      style={inputStyle}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido *</label>
                    <input
                      type="text"
                      value={editForm.last_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      style={inputStyle}
                      placeholder="Tu apellido"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      style={inputStyle}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      style={inputStyle}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                  📍 Ubicación
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Ciudad</label>
                    <input
                      type="text"
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      style={inputStyle}
                      placeholder="Santiago, Valparaíso, etc."
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Región</label>
                    <select
                      value={editForm.region || ''}
                      onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">Selecciona una región</option>
                      <option value="Región Metropolitana">Región Metropolitana</option>
                      <option value="Región de Valparaíso">Región de Valparaíso</option>
                      <option value="Región del Biobío">Región del Biobío</option>
                      <option value="Región de Los Lagos">Región de Los Lagos</option>
                      <option value="Región de La Araucanía">Región de La Araucanía</option>
                      <option value="Región de Antofagasta">Región de Antofagasta</option>
                      <option value="Región de Coquimbo">Región de Coquimbo</option>
                      <option value="Región del Maule">Región del Maule</option>
                      <option value="Región de Tarapacá">Región de Tarapacá</option>
                      <option value="Región de Atacama">Región de Atacama</option>
                      <option value="Región de O'Higgins">Región de O'Higgins</option>
                      <option value="Región de Los Ríos">Región de Los Ríos</option>
                      <option value="Región de Aysén">Región de Aysén</option>
                      <option value="Región de Magallanes">Región de Magallanes</option>
                      <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferencias de Vehículos */}
            <div style={{
              background: '#f0f9ff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0369a1', marginBottom: '16px' }}>
                🚗 Preferencias de Vehículos
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <label style={labelStyle}>Precio Mínimo</label>
                  <input
                    type="number"
                    value={editForm.preferred_price_min || ''}
                    onChange={(e) => setEditForm({ ...editForm, preferred_price_min: e.target.value ? parseInt(e.target.value) : undefined })}
                    style={inputStyle}
                    placeholder="5000000"
                    min="0"
                    step="1000000"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Precio Máximo</label>
                  <input
                    type="number"
                    value={editForm.preferred_price_max || ''}
                    onChange={(e) => setEditForm({ ...editForm, preferred_price_max: e.target.value ? parseInt(e.target.value) : undefined })}
                    style={inputStyle}
                    placeholder="50000000"
                    min="0"
                    step="1000000"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Marcas Preferidas (separadas por comas)</label>
                  <input
                    type="text"
                    value={editForm.preferred_brands?.join(', ') || ''}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      preferred_brands: e.target.value ? e.target.value.split(',').map(b => b.trim()) : undefined 
                    })}
                    style={inputStyle}
                    placeholder="Toyota, Honda, Nissan"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tipos de Vehículo Preferidos (separados por comas)</label>
                  <input
                    type="text"
                    value={editForm.preferred_body_types?.join(', ') || ''}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      preferred_body_types: e.target.value ? e.target.value.split(',').map(t => t.trim()) : undefined 
                    })}
                    style={inputStyle}
                    placeholder="SUV, Sedán, Hatchback"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancel}
                disabled={saving}
                style={{
                  background: 'transparent',
                  color: '#4a5568',
                  border: '1px solid #e2e8f0',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving 
                    ? '#a0aec0' 
                    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '20px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Guardando...
                  </>
                ) : (
                  <>💾 Guardar Cambios</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

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

export default CustomerProfile