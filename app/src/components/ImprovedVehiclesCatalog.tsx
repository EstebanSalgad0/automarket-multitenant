/**
 * Componente de catálogo de vehículos mejorado usando modelos TypeScript
 */
import React, { useState } from 'react';
import { useVehicleCatalog } from '../hooks/useVehicleCatalog';
import type { VehicleFilters, SortOption } from '../hooks/useVehicleCatalog';
import { Vehicle, FuelType, TransmissionType, BodyType, VehicleStatus } from '../models';
import './VehiclesCatalog.css';

interface ImprovedVehiclesCatalogProps {
  tenantId: string;
  onBack: () => void;
  initialFilters?: Partial<VehicleFilters>;
}

export const ImprovedVehiclesCatalog: React.FC<ImprovedVehiclesCatalogProps> = ({ 
  tenantId, 
  onBack, 
  initialFilters = {} 
}) => {
  const { vehicles, loading, error, stats, actions } = useVehicleCatalog(tenantId);
  const [filters, setFilters] = useState<VehicleFilters>({
    status: VehicleStatus.AVAILABLE, // Solo mostrar disponibles por defecto
    ...initialFilters
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Aplicar filtros cuando cambien
  React.useEffect(() => {
    actions.applyFilters(filters);
  }, [filters]);

  // Aplicar ordenamiento cuando cambie
  React.useEffect(() => {
    actions.sortVehicles(sortBy);
  }, [sortBy]);

  // Aplicar búsqueda cuando cambie el término
  React.useEffect(() => {
    actions.searchVehicles(searchTerm);
  }, [searchTerm]);

  const handleFilterChange = (key: keyof VehicleFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: VehicleStatus.AVAILABLE });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="vehicles-catalog">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicles-catalog">
        <div className="error-state">
          <h3>Error al cargar vehículos</h3>
          <p>{error}</p>
          <button onClick={actions.refresh} className="btn-retry">
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
        <button onClick={onBack} className="btn-back">
          ← Volver
        </button>
        <h1>Catálogo de Vehículos</h1>
        <div className="catalog-stats">
          <span>{stats.total} vehículos</span>
          <span>{stats.available} disponibles</span>
          <span>Precio promedio: ${stats.avgPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="catalog-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar por marca, modelo, color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Tipo:</label>
            <select 
              value={filters.type || ''} 
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            >
              <option value="">Todos</option>
              {Object.values(BodyType).map((type: string) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Transmisión:</label>
            <select 
              value={filters.transmission || ''} 
              onChange={(e) => handleFilterChange('transmission', e.target.value || undefined)}
            >
              <option value="">Todas</option>
              {Object.values(TransmissionType).map((trans: string) => (
                <option key={trans} value={trans}>
                  {trans.charAt(0).toUpperCase() + trans.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Combustible:</label>
            <select 
              value={filters.fuel || ''} 
              onChange={(e) => handleFilterChange('fuel', e.target.value || undefined)}
            >
              <option value="">Todos</option>
              {Object.values(FuelType).map((fuel: string) => (
                <option key={fuel} value={fuel}>
                  {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Precio máximo:</label>
            <input
              type="number"
              placeholder="0"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div className="filter-group">
            <label>Año mínimo:</label>
            <input
              type="number"
              placeholder="2000"
              value={filters.yearMin || ''}
              onChange={(e) => handleFilterChange('yearMin', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <button onClick={clearFilters} className="btn-clear-filters">
            Limpiar filtros
          </button>
        </div>

        <div className="view-controls">
          <div className="sort-controls">
            <label>Ordenar por:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
              <option value="mileageAsc">Menor millaje</option>
              <option value="mileageDesc">Mayor millaje</option>
            </select>
          </div>

          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''} 
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="catalog-results">
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <h3>No se encontraron vehículos</h3>
            <p>Intenta ajustar tus filtros de búsqueda</p>
          </div>
        ) : (
          <div className={`vehicles-grid ${viewMode}`}>
            {vehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onToggleFavorite={actions.toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Componente para mostrar un vehículo individual
 */
interface VehicleCardProps {
  vehicle: Vehicle;
  onToggleFavorite: (vehicleId: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onToggleFavorite }) => {
  const primaryImage = vehicle.getPrimaryImage();
  const depreciationPercentage = vehicle.calculateDepreciation();

  return (
    <div className="vehicle-card">
      <div className="vehicle-image">
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.alt_text || vehicle.toString()} />
        ) : (
          <div className="no-image">
            <span>Sin imagen</span>
          </div>
        )}
        <button 
          className="btn-favorite" 
          onClick={() => onToggleFavorite(vehicle.id)}
          title="Agregar a favoritos"
        >
          ♡
        </button>
        <div className="status-badge" data-status={vehicle.status}>
          {vehicle.status}
        </div>
      </div>

      <div className="vehicle-info">
        <h3 className="vehicle-title">
          {vehicle.make} {vehicle.model} {vehicle.year}
        </h3>
        
        <p className="vehicle-price">
          ${vehicle.price.toLocaleString()} {vehicle.currency}
        </p>

        <div className="vehicle-details">
          <span className="detail">
            📊 {vehicle.mileage.toLocaleString()} km
          </span>
          <span className="detail">
            ⚙️ {vehicle.transmission}
          </span>
          <span className="detail">
            ⛽ {vehicle.fuel_type}
          </span>
          <span className="detail">
            🚗 {vehicle.body_type}
          </span>
        </div>

        <div className="vehicle-location">
          📍 {vehicle.location_city}, {vehicle.location_state}
        </div>

        {vehicle.description && (
          <p className="vehicle-description">
            {vehicle.description.length > 100 
              ? `${vehicle.description.substring(0, 100)}...` 
              : vehicle.description
            }
          </p>
        )}

        {depreciationPercentage > 0 && (
          <div className="depreciation-info">
            <small>Depreciación estimada: {depreciationPercentage}%</small>
          </div>
        )}

        <div className="vehicle-actions">
          <button className="btn-contact">Contactar</button>
          <button className="btn-details">Ver detalles</button>
        </div>
      </div>
    </div>
  );
};