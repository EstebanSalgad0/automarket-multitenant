import React, { useState, useEffect } from 'react';
import './VehiclesCatalog.css';
import { VehicleServiceSimple, type VehicleWithTenant } from '../services/vehicleServiceSimple';

interface VehiclesCatalogProps {
  onBack: () => void;
  initialFilters?: {
    type?: string;
    brand?: string;
    maxPrice?: string;
    location?: string;
  };
}

const VehiclesCatalogSimple: React.FC<VehiclesCatalogProps> = ({ onBack, initialFilters }) => {
  const [filters, setFilters] = useState({
    marca: initialFilters?.brand || '',
    modelo: '',
    añoMin: '',
    añoMax: '',
    precioMin: '',
    precioMax: initialFilters?.maxPrice || '',
    combustible: '',
    transmision: ''
  });

  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Estados para manejo de datos reales
  const [vehicles, setVehicles] = useState<VehicleWithTenant[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar vehículos desde la base de datos
  useEffect(() => {
    loadVehicles();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters();
  }, [vehicles, filters, sortBy]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const vehicleService = new VehicleServiceSimple();
      
      // Inicializar datos de ejemplo si es necesario
      await vehicleService.initializeSampleData();
      
      const result = await vehicleService.getVehicles();
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setVehicles(result.vehicles);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Error al cargar vehículos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    // Aplicar filtros
    if (filters.marca) {
      filtered = filtered.filter(v => 
        v.marca.toLowerCase().includes(filters.marca.toLowerCase())
      );
    }
    if (filters.modelo) {
      filtered = filtered.filter(v => 
        v.modelo.toLowerCase().includes(filters.modelo.toLowerCase())
      );
    }
    if (filters.añoMin) {
      filtered = filtered.filter(v => v.año >= parseInt(filters.añoMin));
    }
    if (filters.añoMax) {
      filtered = filtered.filter(v => v.año <= parseInt(filters.añoMax));
    }
    if (filters.precioMin) {
      filtered = filtered.filter(v => v.precio >= parseFloat(filters.precioMin));
    }
    if (filters.precioMax) {
      filtered = filtered.filter(v => v.precio <= parseFloat(filters.precioMax));
    }
    if (filters.combustible) {
      filtered = filtered.filter(v => v.combustible === filters.combustible);
    }
    if (filters.transmision) {
      filtered = filtered.filter(v => v.transmision === filters.transmision);
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.precio - b.precio);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.precio - a.precio);
        break;
      case 'year-new':
        filtered.sort((a, b) => b.año - a.año);
        break;
      case 'year-old':
        filtered.sort((a, b) => a.año - b.año);
        break;
      case 'mileage':
        filtered.sort((a, b) => (a.kilometraje || 0) - (b.kilometraje || 0));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredVehicles(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      marca: '',
      modelo: '',
      añoMin: '',
      añoMax: '',
      precioMin: '',
      precioMax: '',
      combustible: '',
      transmision: ''
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('es-CL').format(mileage) + ' km';
  };

  const getPlaceholderImage = (marca: string, modelo: string) => {
    return `https://via.placeholder.com/400x300/4299E1/ffffff?text=${encodeURIComponent(marca + ' ' + modelo)}`;
  };

  if (loading) {
    return (
      <div className="vehicles-catalog">
        <div className="catalog-header">
          <button onClick={onBack} className="back-button">
            ← Volver
          </button>
          <h1>Catálogo de Vehículos</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicles-catalog">
        <div className="catalog-header">
          <button onClick={onBack} className="back-button">
            ← Volver
          </button>
          <h1>Catálogo de Vehículos</h1>
        </div>
        <div className="error-container">
          <p className="error-message">❌ {error}</p>
          <button onClick={loadVehicles} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicles-catalog">
      {/* Header */}
      <div className="catalog-header">
        <button onClick={onBack} className="back-button">
          ← Volver
        </button>
        <div className="header-content">
          <h1>Catálogo de Vehículos</h1>
          <p>Encuentra el vehículo perfecto para ti</p>
        </div>
        <div className="view-controls">
          <div className="view-mode">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              ⊞
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <select 
            value={filters.marca} 
            onChange={(e) => handleFilterChange('marca', e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las marcas</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Nissan">Nissan</option>
            <option value="Ford">Ford</option>
            <option value="Chevrolet">Chevrolet</option>
          </select>

          <input
            type="text"
            placeholder="Modelo"
            value={filters.modelo}
            onChange={(e) => handleFilterChange('modelo', e.target.value)}
            className="filter-input"
          />

          <select
            value={filters.combustible}
            onChange={(e) => handleFilterChange('combustible', e.target.value)}
            className="filter-select"
          >
            <option value="">Combustible</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diésel">Diésel</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Eléctrico">Eléctrico</option>
          </select>

          <select
            value={filters.transmision}
            onChange={(e) => handleFilterChange('transmision', e.target.value)}
            className="filter-select"
          >
            <option value="">Transmisión</option>
            <option value="Manual">Manual</option>
            <option value="Automática">Automática</option>
            <option value="CVT">CVT</option>
          </select>
        </div>

        <div className="filters-row">
          <input
            type="number"
            placeholder="Año mín."
            value={filters.añoMin}
            onChange={(e) => handleFilterChange('añoMin', e.target.value)}
            className="filter-input"
          />

          <input
            type="number"
            placeholder="Año máx."
            value={filters.añoMax}
            onChange={(e) => handleFilterChange('añoMax', e.target.value)}
            className="filter-input"
          />

          <input
            type="number"
            placeholder="Precio mín."
            value={filters.precioMin}
            onChange={(e) => handleFilterChange('precioMin', e.target.value)}
            className="filter-input"
          />

          <input
            type="number"
            placeholder="Precio máx."
            value={filters.precioMax}
            onChange={(e) => handleFilterChange('precioMax', e.target.value)}
            className="filter-input"
          />

          <button onClick={clearFilters} className="clear-filters">
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Results info */}
      <div className="results-info">
        <span className="results-count">
          {filteredVehicles.length} vehículo{filteredVehicles.length !== 1 ? 's' : ''} encontrado{filteredVehicles.length !== 1 ? 's' : ''}
        </span>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="newest">Más recientes</option>
          <option value="price-low">Precio: menor a mayor</option>
          <option value="price-high">Precio: mayor a menor</option>
          <option value="year-new">Año: más nuevo</option>
          <option value="year-old">Año: más antiguo</option>
          <option value="mileage">Menor kilometraje</option>
        </select>
      </div>

      {/* Vehicles grid/list */}
      <div className={`vehicles-container ${viewMode}`}>
        {filteredVehicles.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron vehículos que coincidan con los filtros seleccionados.</p>
            <button onClick={clearFilters} className="clear-filters-btn">
              Ver todos los vehículos
            </button>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={`${vehicle.tenant_id}-${vehicle.id}`} className="vehicle-card">
              <div className="vehicle-image">
                <img 
                  src={getPlaceholderImage(vehicle.marca, vehicle.modelo)}
                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getPlaceholderImage(vehicle.marca, vehicle.modelo);
                  }}
                />
                <div className="vehicle-badge">{vehicle.estado}</div>
              </div>
              
              <div className="vehicle-info">
                <div className="vehicle-header">
                  <h3 className="vehicle-title">{vehicle.marca} {vehicle.modelo}</h3>
                  <span className="vehicle-year">{vehicle.año}</span>
                </div>
                
                <p className="vehicle-price">{formatPrice(vehicle.precio)}</p>
                
                <div className="vehicle-details">
                  <span className="detail">📏 {formatMileage(vehicle.kilometraje || 0)}</span>
                  <span className="detail">⚙️ {vehicle.transmision}</span>
                  <span className="detail">⛽ {vehicle.combustible}</span>
                </div>

                {vehicle.color && (
                  <div className="vehicle-meta">
                    <span className="color">🎨 {vehicle.color}</span>
                  </div>
                )}

                <div className="vehicle-seller">
                  <span className="seller">🏪 {vehicle.tenants?.nombre || 'AutoMarket'}</span>
                </div>

                {vehicle.descripcion && (
                  <p className="vehicle-description">
                    {vehicle.descripcion.length > 100 
                      ? vehicle.descripcion.substring(0, 100) + '...'
                      : vehicle.descripcion
                    }
                  </p>
                )}

                <div className="vehicle-actions">
                  <button className="contact-btn">
                    📞 Contactar
                  </button>
                  <button className="details-btn">
                    👁️ Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredVehicles.length > 0 && (
        <div className="pagination">
          <p>Mostrando {filteredVehicles.length} vehículos de {vehicles.length} totales</p>
        </div>
      )}
    </div>
  );
};

export default VehiclesCatalogSimple;