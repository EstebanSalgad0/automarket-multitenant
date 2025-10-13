import { useState, useEffect } from 'react'
import { vehicleService, type VehicleWithImages } from '../../services/vehicleService'
import { useAuth } from '../../hooks/useAuth'

import { PermissionGuard, SellerGuard } from '../security/PermissionGuards'
import { Permission } from '../../lib/permissions'
import { auditService } from '../../services/auditService'
import VehicleForm from './VehicleForm'
import './VehicleManagement.css'

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<VehicleWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<VehicleWithImages | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithImages | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'reserved' | 'draft' | 'suspended'>('all')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadVehicles()
    }
  }, [user])

  const loadVehicles = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { vehicles: userVehicles } = await vehicleService.getUserVehicles(user.id)
      setVehicles(userVehicles)
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVehicle = () => {
    setEditingVehicle(null)
    setShowForm(true)
  }

  const handleEditVehicle = (vehicle: VehicleWithImages) => {
    setEditingVehicle(vehicle)
    setShowForm(true)
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) return

    try {
      // Obtener información del vehículo antes de eliminarlo
      const vehicle = vehicles.find(v => v.id === vehicleId)
      const vehicleInfo = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : `ID: ${vehicleId}`
      
      const { error } = await vehicleService.deleteVehicle(vehicleId)
      if (error) {
        alert('Error al eliminar el vehículo: ' + error.message)
        return
      }
      
      // Registrar eliminación en auditoría
      if (user) {
        await auditService.logVehicleDeleted(
          user.id,
          user.email || 'unknown',
          vehicleId,
          vehicleInfo,
          user.user_metadata?.tenant_id || 'unknown'
        )
      }
      
      alert('Vehículo eliminado exitosamente')
      loadVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Error al eliminar el vehículo')
    }
  }

  const handleStatusChange = async (vehicleId: string, newStatus: 'active' | 'sold' | 'reserved' | 'draft' | 'suspended') => {
    try {
      const { error } = await vehicleService.updateVehicleStatus(vehicleId, newStatus)
      if (error) {
        alert('Error al actualizar el estado: ' + error.message)
        return
      }
      
      loadVehicles()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingVehicle(null)
    loadVehicles()
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === 'all') return true
    return vehicle.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'sold': return 'status-sold'
      case 'reserved': return 'status-reserved'
      case 'draft': return 'status-draft'
      case 'suspended': return 'status-suspended'
      default: return 'status-inactive'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Disponible'
      case 'sold': return 'Vendido'
      case 'reserved': return 'Reservado'
      case 'draft': return 'Borrador'
      case 'suspended': return 'Suspendido'
      default: return 'Desconocido'
    }
  }

  if (loading) {
    return (
      <div className="vehicle-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      </div>
    )
  }

  return (
    <SellerGuard>
      <div className="vehicle-management">
      <div className="vehicle-management-header">
        <h2>Gestión de Vehículos</h2>
        <button 
          className="btn-primary"
          onClick={handleCreateVehicle}
        >
          + Publicar Nuevo Vehículo
        </button>
      </div>

      {/* Filtros */}
      <div className="vehicle-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({vehicles.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Disponibles ({vehicles.filter(v => v.status === 'active').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'sold' ? 'active' : ''}`}
          onClick={() => setFilter('sold')}
        >
          Vendidos ({vehicles.filter(v => v.status === 'sold').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'reserved' ? 'active' : ''}`}
          onClick={() => setFilter('reserved')}
        >
          Reservados ({vehicles.filter(v => v.status === 'reserved').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Borrador ({vehicles.filter(v => v.status === 'draft').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'suspended' ? 'active' : ''}`}
          onClick={() => setFilter('suspended')}
        >
          Suspendidos ({vehicles.filter(v => v.status === 'suspended').length})
        </button>
      </div>

      {/* Lista de vehículos */}
      <div className="vehicles-grid">
        {filteredVehicles.length === 0 ? (
          <div className="no-vehicles">
            <h3>No hay vehículos {filter !== 'all' ? `con estado "${getStatusText(filter)}"` : ''}</h3>
            <p>¡Comienza publicando tu primer vehículo!</p>
            <button 
              className="btn-primary"
              onClick={handleCreateVehicle}
            >
              Publicar Vehículo
            </button>
          </div>
        ) : (
          filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-image">
                {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
                  <img 
                    src={vehicle.vehicle_images.find(img => img.is_primary)?.image_url || vehicle.vehicle_images[0].image_url} 
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  />
                ) : (
                  <div className="no-image" onClick={() => setSelectedVehicle(vehicle)}>
                    <span>Sin imagen</span>
                  </div>
                )}
                <div className={`vehicle-status ${getStatusColor(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </div>
              </div>

              <div className="vehicle-info">
                <h3>{vehicle.brand} {vehicle.model}</h3>
                <p className="vehicle-year-price">
                  {vehicle.year} • ${vehicle.price?.toLocaleString()}
                </p>
                <p className="vehicle-details">
                  {vehicle.mileage?.toLocaleString()} km • {vehicle.fuel_type} • {vehicle.transmission}
                </p>
                <p className="vehicle-views">
                  👁 {vehicle.views_count || 0} vistas
                </p>
              </div>

              <div className="vehicle-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  Ver Detalles
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => handleEditVehicle(vehicle)}
                >
                  Editar
                </button>
                
                {/* Selector de estado */}
                <select 
                  value={vehicle.status}
                  onChange={(e) => handleStatusChange(vehicle.id, e.target.value as any)}
                  className="status-selector"
                >
                  <option value="active">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="sold">Vendido</option>
                  <option value="draft">Borrador</option>
                  <option value="suspended">Suspendido</option>
                </select>

                <PermissionGuard permission={Permission.DELETE_OWN_VEHICLES}>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    Eliminar
                  </button>
                </PermissionGuard>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {/* Modal de detalles - Temporalmente comentado hasta crear VehicleDetailModal */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Detalles del Vehículo</h3>
            <p><strong>{selectedVehicle.brand} {selectedVehicle.model}</strong></p>
            <p>Año: {selectedVehicle.year}</p>
            <p>Precio: ${selectedVehicle.price?.toLocaleString()}</p>
            <p>Estado: {getStatusText(selectedVehicle.status)}</p>
            <button onClick={() => setSelectedVehicle(null)}>Cerrar</button>
          </div>
        </div>
      )}
      </div>
    </SellerGuard>
  )
}