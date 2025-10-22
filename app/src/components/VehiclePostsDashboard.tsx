import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { vehicleServiceSimple, type VehicleWithTenant } from '../services/vehicleServiceSimple';
import { supabase } from '../lib/supabase';

interface VehiclePostsDashboardProps {
}

const VehiclePostsDashboard: React.FC<VehiclePostsDashboardProps> = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleWithTenant[]>([]);
  const [userTenantId, setUserTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    disponible: 0,
    vendido: 0,
    reservado: 0
  });

  // Estados para formulario de creación
  const [newVehicle, setNewVehicle] = useState({
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    precio: '',
    kilometraje: '',
    color: '',
    combustible: 'Gasolina',
    transmision: 'Manual',
    descripcion: '',
    estado: 'disponible'
  });

  useEffect(() => {
    if (user) {
      loadUserTenant();
    }
  }, [user]);

  useEffect(() => {
    if (userTenantId) {
      loadVehicles();
    }
  }, [userTenantId]);

  const loadUserTenant = async () => {
    if (!user?.email) return;

    try {
      // Obtener el usuario de la tabla usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      if (usuarioError || !usuarioData) {
        console.error('Usuario no encontrado:', usuarioError);
        return;
      }

      // Obtener el tenant del usuario
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_usuarios')
        .select('tenant_id')
        .eq('usuario_id', (usuarioData as any).id)
        .single();

      if (tenantError || !tenantData) {
        console.error('Tenant no encontrado:', tenantError);
        return;
      }

      setUserTenantId((tenantData as any).tenant_id);
    } catch (error) {
      console.error('Error cargando tenant del usuario:', error);
    }
  };

  const loadVehicles = async () => {
    if (!userTenantId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await vehicleServiceSimple.getVehiclesByTenant(userTenantId);

      if (result.error) {
        setError(result.error.message);
      } else {
        setVehicles(result.vehicles);
        calculateStats(result.vehicles);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (vehicleList: VehicleWithTenant[]) => {
    const stats = {
      total: vehicleList.length,
      disponible: vehicleList.filter(v => v.estado === 'disponible').length,
      vendido: vehicleList.filter(v => v.estado === 'vendido').length,
      reservado: vehicleList.filter(v => v.estado === 'reservado').length
    };
    setStats(stats);
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userTenantId) {
      setError('No se pudo identificar tu organización');
      return;
    }

    try {
      setLoading(true);

      const vehicleData = {
        tenant_id: userTenantId,
        marca: newVehicle.marca,
        modelo: newVehicle.modelo,
        año: newVehicle.año,
        precio: parseFloat(newVehicle.precio),
        kilometraje: parseInt(newVehicle.kilometraje) || 0,
        color: newVehicle.color,
        combustible: newVehicle.combustible,
        transmision: newVehicle.transmision,
        descripcion: newVehicle.descripcion,
        estado: newVehicle.estado as 'disponible' | 'vendido' | 'reservado'
      };

      const result = await vehicleServiceSimple.createVehicle(vehicleData);

      if (result.error) {
        setError(result.error.message);
      } else {
        // Resetear formulario
        setNewVehicle({
          marca: '',
          modelo: '',
          año: new Date().getFullYear(),
          precio: '',
          kilometraje: '',
          color: '',
          combustible: 'Gasolina',
          transmision: 'Manual',
          descripcion: '',
          estado: 'disponible'
        });
        setShowCreateForm(false);
        
        // Recargar vehículos
        await loadVehicles();
      }
    } catch (err) {
      console.error('Error creating vehicle:', err);
      setError('Error al crear vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVehicleStatus = async (vehicleId: string, newStatus: string) => {
    if (!userTenantId) return;

    try {
      const result = await vehicleServiceSimple.updateVehicle(userTenantId, vehicleId, {
        estado: newStatus as 'disponible' | 'vendido' | 'reservado'
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        await loadVehicles();
      }
    } catch (err) {
      console.error('Error updating vehicle status:', err);
      setError('Error al actualizar vehículo');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="posts-dashboard">
        <div className="loading">Cargando publicaciones...</div>
      </div>
    );
  }

  return (
    <div className="posts-dashboard">
      <div className="dashboard-header">
        <h3>Mis Vehículos Publicados</h3>
        <button 
          className="create-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Nuevo Vehículo
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card available">
          <span className="stat-number">{stats.disponible}</span>
          <span className="stat-label">Disponibles</span>
        </div>
        <div className="stat-card sold">
          <span className="stat-number">{stats.vendido}</span>
          <span className="stat-label">Vendidos</span>
        </div>
        <div className="stat-card reserved">
          <span className="stat-number">{stats.reservado}</span>
          <span className="stat-label">Reservados</span>
        </div>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="create-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Nuevo Vehículo</h4>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateVehicle} className="create-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Marca"
                  value={newVehicle.marca}
                  onChange={(e) => setNewVehicle({...newVehicle, marca: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Modelo"
                  value={newVehicle.modelo}
                  onChange={(e) => setNewVehicle({...newVehicle, modelo: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <input
                  type="number"
                  placeholder="Año"
                  value={newVehicle.año}
                  onChange={(e) => setNewVehicle({...newVehicle, año: parseInt(e.target.value)})}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={newVehicle.precio}
                  onChange={(e) => setNewVehicle({...newVehicle, precio: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <input
                  type="number"
                  placeholder="Kilometraje"
                  value={newVehicle.kilometraje}
                  onChange={(e) => setNewVehicle({...newVehicle, kilometraje: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                />
              </div>

              <div className="form-row">
                <select
                  value={newVehicle.combustible}
                  onChange={(e) => setNewVehicle({...newVehicle, combustible: e.target.value})}
                >
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diésel">Diésel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Eléctrico">Eléctrico</option>
                </select>
                <select
                  value={newVehicle.transmision}
                  onChange={(e) => setNewVehicle({...newVehicle, transmision: e.target.value})}
                >
                  <option value="Manual">Manual</option>
                  <option value="Automática">Automática</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <textarea
                placeholder="Descripción del vehículo"
                value={newVehicle.descripcion}
                onChange={(e) => setNewVehicle({...newVehicle, descripcion: e.target.value})}
                rows={3}
              />

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de vehículos */}
      <div className="vehicles-list">
        {vehicles.length === 0 ? (
          <div className="no-vehicles">
            <p>Aún no has publicado ningún vehículo.</p>
            <button onClick={() => setShowCreateForm(true)}>
              Crear mi primera publicación
            </button>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-item">
              <div className="vehicle-image-placeholder">
                <span>{vehicle.marca} {vehicle.modelo}</span>
              </div>
              
              <div className="vehicle-details">
                <h4>{vehicle.marca} {vehicle.modelo} {vehicle.año}</h4>
                <p className="price">{formatPrice(vehicle.precio)}</p>
                <div className="meta">
                  <span>🏃 {vehicle.kilometraje?.toLocaleString()} km</span>
                  <span>⚙️ {vehicle.transmision}</span>
                  <span>⛽ {vehicle.combustible}</span>
                  {vehicle.color && <span>🎨 {vehicle.color}</span>}
                </div>
                {vehicle.descripcion && (
                  <p className="description">{vehicle.descripcion}</p>
                )}
              </div>

              <div className="vehicle-actions">
                <select
                  value={vehicle.estado}
                  onChange={(e) => handleUpdateVehicleStatus(vehicle.id, e.target.value)}
                  className={`status-select ${vehicle.estado}`}
                >
                  <option value="disponible">Disponible</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                </select>
                
                <div className="action-buttons">
                  <button className="edit-btn">✏️ Editar</button>
                  <button className="stats-btn">📊 Ver stats</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VehiclePostsDashboard;