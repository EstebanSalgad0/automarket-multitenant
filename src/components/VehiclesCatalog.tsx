import React, { useState } from 'react';
import './VehiclesCatalog.css';

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

  // Mock data - en producción vendría de una API
  const mockVehicles: Vehicle[] = [
    {
      id: 1,
      title: 'Toyota Corolla GLi 1.8',
      price: '$18.500.000',
      year: 2022,
      mileage: '15.000 km',
      transmission: 'Automática',
      fuel: 'Gasolina',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      sellerType: 'dealer',
      sellerName: 'Toyota Centro',
      location: 'Santiago Centro',
      brand: 'Toyota',
      model: 'Corolla',
      type: 'Sedán'
    },
    {
      id: 2,
      title: 'Honda Civic Sport 2.0',
      price: '$22.900.000',
      year: 2023,
      mileage: '8.500 km',
      transmission: 'Manual',
      fuel: 'Gasolina',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      sellerType: 'dealer',
      sellerName: 'Honda Premium',
      location: 'Las Condes',
      brand: 'Honda',
      model: 'Civic',
      type: 'Sedán'
    },
    {
      id: 3,
      title: 'Mazda CX-5 AWD',
      price: '$28.750.000',
      year: 2023,
      mileage: '12.000 km',
      transmission: 'Automática',
      fuel: 'Gasolina',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      sellerType: 'individual',
      sellerName: 'Carlos González',
      location: 'Providencia',
      brand: 'Mazda',
      model: 'CX-5',
      type: 'SUV'
    },
    {
      id: 4,
      title: 'Nissan Sentra Advance',
      price: '$16.200.000',
      year: 2021,
      mileage: '32.000 km',
      transmission: 'Automática',
      fuel: 'Gasolina',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      sellerType: 'individual',
      sellerName: 'María Fernández',
      location: 'Ñuñoa',
      brand: 'Nissan',
      model: 'Sentra',
      type: 'Sedán'
    },
    {
      id: 5,
      title: 'Hyundai Tucson 4WD',
      price: '$24.500.000',
      year: 2022,
      mileage: '18.500 km',
      transmission: 'Automática',
      fuel: 'Gasolina',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      sellerType: 'dealer',
      sellerName: 'Hyundai Motors',
      location: 'Maipú',
      brand: 'Hyundai',
      model: 'Tucson',
      type: 'SUV'
    },
    {
      id: 6,
      title: 'Chevrolet Tracker LTZ',
      price: '$19.800.000',
      year: 2022,
      mileage: '25.000 km',
      transmission: 'Automática',
      fuel: 'Gasolina',
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      sellerType: 'individual',
      sellerName: 'Roberto Silva',
      location: 'San Miguel',
      brand: 'Chevrolet',
      model: 'Tracker',
      type: 'SUV'
    }
  ];

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
  const filteredVehicles = mockVehicles.filter(vehicle => {
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
