import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import './PostsDashboard.css'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price: number
  mileage: number
  fuel_type: string
  transmission: string
  color: string
  created_at: string
  updated_at: string
}

interface PostsDashboardProps {
  user: User
}

export const PostsDashboard: React.FC<PostsDashboardProps> = ({ user }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Estados para simulación de estadísticas
  const [vehicleStats, setVehicleStats] = useState<{[key: string]: {views: number, contacts: number}}>({})

  useEffect(() => {
    loadVehicles()
  }, [user])

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setVehicles(data || [])
      
      // Inicializar estadísticas simuladas
      const stats: {[key: string]: {views: number, contacts: number}} = {}
      data?.forEach((vehicle: any) => {
        stats[vehicle.id] = {
          views: Math.floor(Math.random() * 150 + 10),
          contacts: Math.floor(Math.random() * 25 + 1)
        }
      })
      setVehicleStats(stats)

    } catch (err: any) {
      console.error('Error cargando vehículos:', err)
      setError('Error cargando los vehículos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const incrementViews = (vehicleId: string) => {
    setVehicleStats(prev => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        views: (prev[vehicleId]?.views || 0) + 1
      }
    }))
    setSuccess('✅ Vista agregada')
    setTimeout(() => setSuccess(null), 2000)
  }

  const incrementContacts = (vehicleId: string) => {
    setVehicleStats(prev => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        contacts: (prev[vehicleId]?.contacts || 0) + 1
      }
    }))
    setSuccess('✅ Contacto agregado')
    setTimeout(() => setSuccess(null), 2000)
  }

  const deleteVehicle = async (vehicleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) throw error

      setSuccess('✅ Vehículo eliminado')
      loadVehicles()

      setTimeout(() => setSuccess(null), 3000)

    } catch (err: any) {
      setError('Error eliminando vehículo: ' + err.message)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalViews = Object.values(vehicleStats).reduce((sum, stats) => sum + stats.views, 0)
  const totalContacts = Object.values(vehicleStats).reduce((sum, stats) => sum + stats.contacts, 0)

  if (loading) {
    return (
      <div className="posts-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Cargando vehículos...</p>
      </div>
    )
  }

  return (
    <div className="posts-dashboard">
      <div className="dashboard-header">
        <h2>🚗 Mis Vehículos Publicados</h2>
        <p>Gestiona tus vehículos y ve las estadísticas de rendimiento</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Estadísticas Rápidas */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-number">{vehicles.length}</span>
          <span className="stat-label">Vehículos Publicados</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{vehicles.length}</span>
          <span className="stat-label">Publicaciones Activas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">0</span>
          <span className="stat-label">Vehículos Vendidos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalViews}</span>
          <span className="stat-label">Vistas Totales</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalContacts}</span>
          <span className="stat-label">Contactos Recibidos</span>
        </div>
      </div>

      {/* Lista de Vehículos */}
      <div className="posts-grid">
        {vehicles.map((vehicle) => {
          const stats = vehicleStats[vehicle.id] || { views: 0, contacts: 0 }
          
          return (
            <div key={vehicle.id} className="post-card">
              <div className="post-header">
                <h3 className="post-title">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </h3>
                <div className="post-status">
                  <span className="status-badge status-active">
                    🟢 Publicado
                  </span>
                </div>
              </div>

              <div className="post-vehicle-info">
                <p className="vehicle-price">{formatCurrency(vehicle.price)}</p>
                <div className="vehicle-details">
                  <span>🏃‍♂️ {vehicle.mileage?.toLocaleString() || 'N/A'} km</span>
                  <span>⛽ {vehicle.fuel_type || 'N/A'}</span>
                  <span>⚙️ {vehicle.transmission || 'N/A'}</span>
                  <span>🎨 {vehicle.color || 'N/A'}</span>
                </div>
              </div>

              <div className="post-stats">
                <div className="stat">
                  <span className="stat-icon">👁️</span>
                  <span>{stats.views}</span>
                  <button 
                    className="btn-increment"
                    onClick={() => incrementViews(vehicle.id)}
                    title="Simular vista"
                  >
                    +1
                  </button>
                </div>
                <div className="stat">
                  <span className="stat-icon">📞</span>
                  <span>{stats.contacts}</span>
                  <button 
                    className="btn-increment"
                    onClick={() => incrementContacts(vehicle.id)}
                    title="Simular contacto"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="post-meta">
                <p className="publish-date">📅 Publicado: {formatDate(vehicle.created_at)}</p>
                {vehicle.updated_at !== vehicle.created_at && (
                  <p className="update-date">📝 Actualizado: {formatDate(vehicle.updated_at)}</p>
                )}
              </div>

              <div className="post-actions">
                <button 
                  className="btn-edit"
                  onClick={() => alert('Funcionalidad de edición pendiente')}
                >
                  ✏️ Editar
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => deleteVehicle(vehicle.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {vehicles.length === 0 && (
        <div className="empty-state">
          <p>🚗 No tienes vehículos publicados</p>
          <p>Los vehículos que agregues desde tu dashboard aparecerán aquí</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="info-panel">
        <h3>📊 Panel de Estadísticas</h3>
        <p>Aquí puedes ver el rendimiento de tus publicaciones:</p>
        <ul>
          <li>🔢 <strong>Vistas:</strong> Número de personas que han visto tu vehículo</li>
          <li>📞 <strong>Contactos:</strong> Interesados que han solicitado más información</li>
          <li>➕ <strong>Simulación:</strong> Usa los botones +1 para simular interacciones</li>
        </ul>
        <div className="note">
          <p><strong>Nota:</strong> Esta es una versión simplificada. Las estadísticas son simuladas para demostración.</p>
        </div>
      </div>
    </div>
  )
}

export default PostsDashboard