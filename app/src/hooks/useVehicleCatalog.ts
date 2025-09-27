/**
 * Hook personalizado para manejar vehículos usando nuestros modelos
 */
import { useState, useEffect } from 'react';
import { Vehicle, ModelFactory, VehicleStatus, FuelType, TransmissionType, BodyType } from '../models';

// Interfaz para filtros del catálogo
export interface VehicleFilters {
  type?: BodyType;
  brand?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  transmission?: TransmissionType;
  fuel?: FuelType;
  location?: string;
  sellerType?: string;
  status?: VehicleStatus;
}

// Interfaz para opciones de ordenamiento
export type SortOption = 'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'mileageAsc' | 'mileageDesc';

/**
 * Hook para gestionar el catálogo de vehículos
 */
export function useVehicleCatalog(tenantId: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga los vehículos desde la API/base de datos
   */
  const loadVehicles = async (filters?: VehicleFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Reemplazar con llamada real a la API
      const mockApiData = await fetchVehiclesFromAPI(tenantId, filters);
      
      // Convertir datos de API a modelos Vehicle
      const vehicleModels = ModelFactory.createVehicles(mockApiData);
      
      setVehicles(vehicleModels);
      setFilteredVehicles(vehicleModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando vehículos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplica filtros a los vehículos
   */
  const applyFilters = (filters: VehicleFilters) => {
    let filtered = vehicles.filter(vehicle => {
      // Validar que el vehículo esté disponible por defecto
      if (filters.status !== undefined && vehicle.status !== filters.status) {
        return false;
      }

      // Filtrar por tipo de carrocería
      if (filters.type && vehicle.body_type !== filters.type) {
        return false;
      }

      // Filtrar por marca
      if (filters.brand && !vehicle.make.toLowerCase().includes(filters.brand.toLowerCase())) {
        return false;
      }

      // Filtrar por modelo
      if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
        return false;
      }

      // Filtrar por año
      if (filters.yearMin && vehicle.year < filters.yearMin) {
        return false;
      }
      if (filters.yearMax && vehicle.year > filters.yearMax) {
        return false;
      }

      // Filtrar por precio
      if (filters.priceMin && vehicle.price < filters.priceMin) {
        return false;
      }
      if (filters.priceMax && vehicle.price > filters.priceMax) {
        return false;
      }

      // Filtrar por millaje
      if (filters.mileageMax && vehicle.mileage > filters.mileageMax) {
        return false;
      }

      // Filtrar por transmisión
      if (filters.transmission && vehicle.transmission !== filters.transmission) {
        return false;
      }

      // Filtrar por combustible
      if (filters.fuel && vehicle.fuel_type !== filters.fuel) {
        return false;
      }

      // Filtrar por ubicación
      if (filters.location) {
        const locationMatch = 
          vehicle.location_city?.toLowerCase().includes(filters.location.toLowerCase()) ||
          vehicle.location_state?.toLowerCase().includes(filters.location.toLowerCase());
        if (!locationMatch) return false;
      }

      return true;
    });

    setFilteredVehicles(filtered);
  };

  /**
   * Ordena los vehículos
   */
  const sortVehicles = (sortBy: SortOption) => {
    const sorted = [...filteredVehicles].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.created_at.getTime() - a.created_at.getTime();
        case 'oldest':
          return a.created_at.getTime() - b.created_at.getTime();
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'mileageAsc':
          return a.mileage - b.mileage;
        case 'mileageDesc':
          return b.mileage - a.mileage;
        default:
          return 0;
      }
    });

    setFilteredVehicles(sorted);
  };

  /**
   * Busca vehículos por texto
   */
  const searchVehicles = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = vehicles.filter(vehicle => {
      return (
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.description?.toLowerCase().includes(searchLower) ||
        vehicle.color.toLowerCase().includes(searchLower)
      );
    });

    setFilteredVehicles(filtered);
  };

  /**
   * Obtiene estadísticas del catálogo
   */
  const getStats = () => {
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length,
      sold: vehicles.filter(v => v.status === VehicleStatus.SOLD).length,
      reserved: vehicles.filter(v => v.status === VehicleStatus.RESERVED).length,
      avgPrice: vehicles.length > 0 
        ? vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length 
        : 0,
      avgMileage: vehicles.length > 0 
        ? vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length 
        : 0
    };
  };

  /**
   * Marca un vehículo como favorito (ejemplo de manipulación)
   */
  const toggleFavorite = (vehicleId: string) => {
    // En una implementación real, esto se guardaría en el backend
    console.log(`Toggle favorite for vehicle: ${vehicleId}`);
  };

  // Cargar vehículos al montar el componente
  useEffect(() => {
    loadVehicles();
  }, [tenantId]);

  return {
    vehicles: filteredVehicles,
    allVehicles: vehicles,
    loading,
    error,
    stats: getStats(),
    actions: {
      loadVehicles,
      applyFilters,
      sortVehicles,
      searchVehicles,
      toggleFavorite,
      refresh: () => loadVehicles()
    }
  };
}

/**
 * Mock function para simular API call
 * TODO: Reemplazar con implementación real
 */
async function fetchVehiclesFromAPI(tenantId: string, _filters?: VehicleFilters): Promise<any[]> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Datos mock que simulan respuesta de API
  return [
    {
      id: "vehicle-1",
      tenant_id: tenantId,
      seller_id: "seller-1",
      make: "Toyota",
      model: "Camry",
      year: 2022,
      price: 25000,
      currency: "USD",
      mileage: 15000,
      fuel_type: "gasoline",
      transmission: "automatic",
      body_type: "sedan",
      color: "Blanco",
      description: "Excelente estado, único dueño",
      status: "available",
      images: [],
      features: [],
      location_city: "Miami",
      location_state: "FL",
      created_at: new Date().toISOString()
    },
    {
      id: "vehicle-2",
      tenant_id: tenantId,
      seller_id: "seller-2",
      make: "Honda",
      model: "Civic",
      year: 2023,
      price: 22000,
      currency: "USD",
      mileage: 8000,
      fuel_type: "gasoline",
      transmission: "manual",
      body_type: "sedan",
      color: "Azul",
      description: "Deportivo y económico",
      status: "available",
      images: [],
      features: [],
      location_city: "Orlando",
      location_state: "FL",
      created_at: new Date().toISOString()
    },
    {
      id: "vehicle-3",
      tenant_id: tenantId,
      seller_id: "seller-1",
      make: "Ford",
      model: "F-150",
      year: 2021,
      price: 35000,
      currency: "USD",
      mileage: 25000,
      fuel_type: "gasoline",
      transmission: "automatic",
      body_type: "pickup",
      color: "Negro",
      description: "Perfecta para trabajo pesado",
      status: "available",
      images: [],
      features: [],
      location_city: "Tampa",
      location_state: "FL",
      created_at: new Date().toISOString()
    }
  ];
}