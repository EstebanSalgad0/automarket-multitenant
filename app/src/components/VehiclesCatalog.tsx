import React, { useState, useEffect } from 'react';
import './VehiclesCatalog.css';
import { vehicleService } from '../services/vehicleService';

interface Vehicle {
  id: number;
  title: string;
  price: string;
  year: number;
  mileage: string;
  transmission: string;
  fuel: string;
  images: string[];
  sellerType: 'dealer' | 'individual';
  sellerName: string;
  location: string;
  brand: string;
  model: string;
  type: string;
}

interface VehiclesCatalogProps {
  onBack: () => void;
  initialFilters?: {
    type?: string;
    brand?: string;
    maxPrice?: string;
    location?: string;
  };
}

const VehiclesCatalog: React.FC<VehiclesCatalogProps> = ({ onBack, initialFilters }) => {
  const [filters, setFilters] = useState({
    type: initialFilters?.type || '',
    brand: initialFilters?.brand || '',
    model: '',
    yearMin: '',
    yearMax: '',
    priceMin: '',
    priceMax: initialFilters?.maxPrice || '',
    mileageMax: '',
    transmission: '',
    fuel: '',
    location: initialFilters?.location || '',
    sellerType: ''
  });

  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Estados para manejo de datos reales
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar vehículos desde la base de datos
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await vehicleService.getVehicles();
      
      // Transformar datos de Supabase al formato del componente
      const transformedVehicles: Vehicle[] = result.vehicles.map((v: any, index: number) => ({
        id: index + 1, // Usar índice como ID temporal (el UUID no se puede convertir a número)
        title: `${v.make} ${v.model}`,
        price: `$${(v.price / 1).toLocaleString('es-CL')}`,
        year: v.year,
        mileage: `${(v.mileage || 0).toLocaleString('es-CL')} km`,
        transmission: v.transmission === 'automatic' ? 'Automática' : 'Manual',
        fuel: v.fuel_type === 'gasoline' ? 'Gasolina' : v.fuel_type === 'diesel' ? 'Diésel' : v.fuel_type === 'electric' ? 'Eléctrico' : 'Híbrido',
        images: v.vehicle_images?.length > 0 
          ? v.vehicle_images.map((img: any) => img.image_url) 
          : [`https://placehold.co/800x600/4299E1/ffffff?text=${encodeURIComponent(v.make + ' ' + v.model)}`],
        sellerType: 'dealer',
        sellerName: v.tenants?.name || 'AutoMarket',
        location: v.branches?.city || 'Chile',
        brand: v.make,
        model: v.model,
        type: v.body_type === 'sedan' ? 'Sedán' : v.body_type === 'suv' ? 'SUV' : v.body_type === 'hatchback' ? 'Hatchback' : v.body_type === 'pickup' ? 'Pickup' : 'Otro'
      }));
      
      setVehicles(transformedVehicles);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Error al cargar vehículos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Mock data - REMOVIDO, ahora usamos datos reales

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      brand: '',
      model: '',
      yearMin: '',
      yearMax: '',
      priceMin: '',
      priceMax: '',
      mileageMax: '',
      transmission: '',
      fuel: '',
      location: '',
      sellerType: ''
    });
  };

  // Filtrar vehículos basado en los filtros aplicados
  const filteredVehicles = vehicles.filter(vehicle => {
    return (
      (!filters.type || vehicle.type === filters.type) &&
      (!filters.brand || vehicle.brand === filters.brand) &&
      (!filters.model || vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) &&
      (!filters.transmission || vehicle.transmission === filters.transmission) &&
      (!filters.fuel || vehicle.fuel === filters.fuel) &&
      (!filters.location || vehicle.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.sellerType || vehicle.sellerType === filters.sellerType)
    );
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
      case 'price-high':
        return parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, ''));
      case 'year-new':
        return b.year - a.year;
      case 'year-old':
        return a.year - b.year;
      case 'mileage':
        return parseInt(a.mileage.replace(/[^\d]/g, '')) - parseInt(b.mileage.replace(/[^\d]/g, ''));
      default:
        return 0;
    }
  });

  // Mostrar loading
  if (loading) {
    return (
      <div className="vehicles-catalog">
        <div className="loading-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #007bff', 
            borderRadius: '50%', 
            width: '50px', 
            height: '50px', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', color: '#666' }}>Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="vehicles-catalog">
        <div className="error-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '18px', color: '#d32f2f', marginBottom: '20px' }}>{error}</p>
          <button 
            onClick={loadVehicles}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicles-catalog">
      {/* Header */}
      <header className="catalog-header">
        <div className="catalog-header-container">
          <div className="header-content">
            <button className="back-button" onClick={onBack}>
              ← Volver
            </button>
            <h1>Catálogo de Vehículos</h1>
            <div className="header-stats">
              <span>{filteredVehicles.length} vehículos encontrados</span>
            </div>
          </div>
        </div>
      </header>

      <div className="catalog-container">
        {/* Sidebar con filtros */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filtros</h3>
            <button className="clear-filters" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>

          <div className="filter-section">
            <h4>Tipo de vehículo</h4>
            <select 
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="Sedán">Sedán</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Pickup">Pickup</option>
              <option value="Convertible">Convertible</option>
            </select>
          </div>

          <div className="filter-section">
            <h4>Marca</h4>
            <select 
              value={filters.brand} 
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">Todas las marcas</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Mazda">Mazda</option>
              <option value="Nissan">Nissan</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Chevrolet">Chevrolet</option>
            </select>
          </div>

          <div className="filter-section">
            <h4>Modelo</h4>
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />
          </div>

          <div className="filter-section">
            <h4>Año</h4>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Desde"
                value={filters.yearMin}
                onChange={(e) => handleFilterChange('yearMin', e.target.value)}
              />
              <input
                type="number"
                placeholder="Hasta"
                value={filters.yearMax}
                onChange={(e) => handleFilterChange('yearMax', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <h4>Precio (CLP)</h4>
            <div className="range-inputs">
              <input
                type="text"
                placeholder="Precio mínimo"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              />
              <input
                type="text"
                placeholder="Precio máximo"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <h4>Transmisión</h4>
            <select 
              value={filters.transmission} 
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
            >
              <option value="">Cualquiera</option>
              <option value="Manual">Manual</option>
              <option value="Automática">Automática</option>
            </select>
          </div>

          <div className="filter-section">
            <h4>Combustible</h4>
            <select 
              value={filters.fuel} 
              onChange={(e) => handleFilterChange('fuel', e.target.value)}
            >
              <option value="">Cualquiera</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Diésel">Diésel</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Eléctrico">Eléctrico</option>
            </select>
          </div>

          <div className="filter-section">
            <h4>Ubicación</h4>
            <input
              type="text"
              placeholder="Ciudad o comuna..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          <div className="filter-section">
            <h4>Tipo de vendedor</h4>
            <select 
              value={filters.sellerType} 
              onChange={(e) => handleFilterChange('sellerType', e.target.value)}
            >
              <option value="">Cualquiera</option>
              <option value="dealer">Concesionario</option>
              <option value="individual">Particular</option>
            </select>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="catalog-main">
          {/* Barra de herramientas */}
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="sort-options">
                <label>Ordenar por:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Más recientes</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                  <option value="year-new">Año: más nuevo</option>
                  <option value="year-old">Año: más antiguo</option>
                  <option value="mileage">Menor kilometraje</option>
                </select>
              </div>
            </div>
            <div className="toolbar-right">
              <div className="view-toggle">
                <button 
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  ⊞
                </button>
                <button 
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Grid de vehículos */}
          <div className={`vehicles-grid ${viewMode}`}>
            {sortedVehicles.map(vehicle => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-images">
                  <img src={vehicle.images[0]} alt={vehicle.title} />
                  <div className="seller-badge">
                    {vehicle.sellerType === 'dealer' ? '🏢 Concesionario' : '👤 Particular'}
                  </div>
                </div>
                <div className="vehicle-info">
                  <h3 className="vehicle-title">{vehicle.title}</h3>
                  <div className="vehicle-price">{vehicle.price}</div>
                  <div className="vehicle-details">
                    <span>{vehicle.year}</span>
                    <span>{vehicle.mileage}</span>
                    <span>{vehicle.transmission}</span>
                    <span>{vehicle.fuel}</span>
                  </div>
                  <div className="vehicle-seller">
                    <strong>{vehicle.sellerName}</strong>
                    <span>{vehicle.location}</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">Ver detalles</button>
                    <button className="btn-primary">Contactar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedVehicles.length === 0 && (
            <div className="no-results">
              <h3>No se encontraron vehículos</h3>
              <p>Intenta ajustar los filtros para ver más resultados</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VehiclesCatalog;
