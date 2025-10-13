import { useState } from 'react'
import { vehicleService, type VehicleWithImages } from '../../services/vehicleService'
import { useAuth } from '../../hooks/useAuth'
import './VehicleForm.css'

interface VehicleFormProps {
  vehicle?: VehicleWithImages | null
  onClose: () => void
  onSuccess: () => void
}

export default function VehicleForm({ vehicle, onClose, onSuccess }: VehicleFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    price: vehicle?.price || '',
    mileage: vehicle?.mileage || '',
    condition_type: vehicle?.condition_type || 'used',
    body_type: vehicle?.body_type || 'sedan',
    fuel_type: vehicle?.fuel_type || 'gasoline',
    transmission: vehicle?.transmission || 'manual',
    color: vehicle?.color || '',
    description: vehicle?.description || '',
    features: vehicle?.features?.join(', ') || '',
    status: vehicle?.status || 'active'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const vehicleData = {
        ...formData,
        price: Number(formData.price),
        year: Number(formData.year),
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        tenant_id: user.user_metadata?.tenant_id || 'default',
        seller_id: user.id
      }

      if (vehicle) {
        // Actualizar vehículo existente
        const { error } = await vehicleService.updateVehicle(vehicle.id, vehicleData)
        if (error) throw error
      } else {
        // Crear nuevo vehículo
        const { error } = await vehicleService.createVehicle(vehicleData as any)
        if (error) throw error
      }

      alert(vehicle ? 'Vehículo actualizado exitosamente!' : 'Vehículo creado exitosamente!')
      onSuccess()
    } catch (error) {
      console.error('Error saving vehicle:', error)
      alert('Error al guardar el vehículo: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content vehicle-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{vehicle ? 'Editar Vehículo' : 'Publicar Nuevo Vehículo'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-grid">
            {/* Información básica */}
            <div className="form-group">
              <label htmlFor="brand">Marca *</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                placeholder="Ej: Toyota, Chevrolet"
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Modelo *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                placeholder="Ej: Corolla, Spark"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Año *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Precio *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="Precio en pesos"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mileage">Kilometraje</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                min="0"
                placeholder="Kilometros"
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Ej: Blanco, Negro"
              />
            </div>

            {/* Características técnicas */}
            <div className="form-group">
              <label htmlFor="condition_type">Condición *</label>
              <select
                id="condition_type"
                name="condition_type"
                value={formData.condition_type}
                onChange={handleInputChange}
                required
              >
                <option value="new">Nuevo</option>
                <option value="used">Usado</option>
                <option value="certified_pre_owned">Seminuevo Certificado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="body_type">Tipo de Carrocería</label>
              <select
                id="body_type"
                name="body_type"
                value={formData.body_type}
                onChange={handleInputChange}
              >
                <option value="sedan">Sedán</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="pickup">Pickup</option>
                <option value="convertible">Convertible</option>
                <option value="coupe">Coupé</option>
                <option value="wagon">Station Wagon</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fuel_type">Combustible</label>
              <select
                id="fuel_type"
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleInputChange}
              >
                <option value="gasoline">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="hybrid">Híbrido</option>
                <option value="electric">Eléctrico</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="transmission">Transmisión</label>
              <select
                id="transmission"
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automática</option>
                <option value="cvt">CVT</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Disponible</option>
                <option value="reserved">Reservado</option>
                <option value="sold">Vendido</option>
                <option value="draft">Borrador</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group full-width">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe las características y condición del vehículo..."
            />
          </div>

          {/* Características adicionales */}
          <div className="form-group full-width">
            <label htmlFor="features">Características (separadas por comas)</label>
            <input
              type="text"
              id="features"
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              placeholder="Ej: Aire acondicionado, Vidrios eléctricos, ABS"
            />
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : vehicle ? 'Actualizar Vehículo' : 'Publicar Vehículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}