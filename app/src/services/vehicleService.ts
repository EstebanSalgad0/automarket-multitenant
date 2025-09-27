import { Vehicle, User, ModelFactory } from '../models'
import type { VehicleData, CreateVehicleData } from '../models/Vehicle'
import { VehicleStatus } from '../models/BaseModel'

// Interfaz para vehículos con detalles extendidos
export interface VehicleWithDetails {
  vehicle: Vehicle
  seller?: User
}

export interface VehicleFilters {
  brand?: string
  model?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  bodyType?: string
  fuelType?: string
  transmission?: string
  condition?: string
  location?: string
}

export class VehicleService {
  private static instance: VehicleService

  static getInstance(): VehicleService {
    if (!VehicleService.instance) {
      VehicleService.instance = new VehicleService()
    }
    return VehicleService.instance
  }

  // Datos mock para desarrollo - después se reemplazará con Supabase
  private mockVehicles: VehicleData[] = [
    {
      id: '1',
      tenant_id: 'chile',
      seller_id: 'user1',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      price: 15000,
      currency: 'USD',
      mileage: 25000,
      fuel_type: 'gasoline',
      transmission: 'automatic',
      body_type: 'sedan',
      color: 'Blanco',
      description: 'Excelente estado, mantenciones al día',
      status: VehicleStatus.AVAILABLE,
      images: [
        {
          id: '1',
          url: 'https://example.com/image1.jpg',
          alt_text: 'Toyota Corolla frontal',
          is_primary: true,
          order: 1
        }
      ],
      features: [
        { name: 'Aire Acondicionado', category: 'Confort' },
        { name: 'ABS', category: 'Seguridad' }
      ],
      location_city: 'Santiago',
      location_state: 'RM'
    },
    {
      id: '2',
      tenant_id: 'chile',
      seller_id: 'user2',
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      price: 18000,
      currency: 'USD',
      mileage: 30000,
      fuel_type: 'gasoline',
      transmission: 'manual',
      body_type: 'sedan',
      color: 'Azul',
      description: 'Motor 1.5L turbo, muy económico',
      status: VehicleStatus.AVAILABLE,
      images: [
        {
          id: '2',
          url: 'https://example.com/image2.jpg',
          alt_text: 'Honda Civic lateral',
          is_primary: true,
          order: 1
        }
      ],
      features: [
        { name: 'Turbo', category: 'Motor' },
        { name: 'Pantalla Touch', category: 'Tecnología' }
      ],
      location_city: 'Valparaíso',
      location_state: 'V'
    }
  ]

  // Obtener vehículos con filtros
  async getVehicles(filters: VehicleFilters = {}, limit = 20, offset = 0): Promise<{
    vehicles: VehicleWithDetails[]
    count: number
    error: Error | null
  }> {
    try {
      let filteredVehicles = this.mockVehicles

      // Aplicar filtros
      if (filters.brand) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.make.toLowerCase().includes(filters.brand!.toLowerCase())
        )
      }
      if (filters.model) {
        filteredVehicles = filteredVehicles.filter(v => 
          v.model.toLowerCase().includes(filters.model!.toLowerCase())
        )
      }
      if (filters.yearMin) {
        filteredVehicles = filteredVehicles.filter(v => v.year >= filters.yearMin!)
      }
      if (filters.yearMax) {
        filteredVehicles = filteredVehicles.filter(v => v.year <= filters.yearMax!)
      }
      if (filters.priceMin) {
        filteredVehicles = filteredVehicles.filter(v => v.price >= filters.priceMin!)
      }
      if (filters.priceMax) {
        filteredVehicles = filteredVehicles.filter(v => v.price <= filters.priceMax!)
      }
      if (filters.bodyType) {
        filteredVehicles = filteredVehicles.filter(v => v.body_type === filters.bodyType)
      }
      if (filters.fuelType) {
        filteredVehicles = filteredVehicles.filter(v => v.fuel_type === filters.fuelType)
      }
      if (filters.transmission) {
        filteredVehicles = filteredVehicles.filter(v => v.transmission === filters.transmission)
      }

      // Paginación
      const paginatedVehicles = filteredVehicles.slice(offset, offset + limit)

      // Convertir a nuestros modelos
      const vehiclesWithDetails: VehicleWithDetails[] = paginatedVehicles.map(vehicleData => {
        const vehicle = ModelFactory.createVehicle(vehicleData)
        return { vehicle }
      })

      return {
        vehicles: vehiclesWithDetails,
        count: filteredVehicles.length,
        error: null
      }
    } catch (error) {
      return {
        vehicles: [],
        count: 0,
        error: error as Error
      }
    }
  }

  // Obtener vehículo por ID
  async getVehicleById(id: string): Promise<{
    vehicle: VehicleWithDetails | null
    error: Error | null
  }> {
    try {
      const vehicleData = this.mockVehicles.find(v => v.id === id)
      
      if (!vehicleData) {
        return { vehicle: null, error: new Error('Vehículo no encontrado') }
      }

      const vehicle = ModelFactory.createVehicle(vehicleData)
      const vehicleWithDetails: VehicleWithDetails = { vehicle }

      return {
        vehicle: vehicleWithDetails,
        error: null
      }
    } catch (error) {
      return {
        vehicle: null,
        error: error as Error
      }
    }
  }

  // Crear nuevo vehículo
  async createVehicle(vehicleData: CreateVehicleData): Promise<{
    vehicle: Vehicle | null
    error: Error | null
  }> {
    try {
      const newVehicleData: VehicleData = {
        ...vehicleData,
        id: `vehicle_${Date.now()}`,
        status: VehicleStatus.AVAILABLE,
        images: [],
        features: [],
        created_at: new Date(),
        updated_at: new Date()
      }

      // Agregar a mock data
      this.mockVehicles.push(newVehicleData)

      const vehicle = ModelFactory.createVehicle(newVehicleData)

      return {
        vehicle,
        error: null
      }
    } catch (error) {
      return {
        vehicle: null,
        error: error as Error
      }
    }
  }

  // Actualizar vehículo
  async updateVehicle(id: string, updates: Partial<VehicleData>): Promise<{
    vehicle: Vehicle | null
    error: Error | null
  }> {
    try {
      const vehicleIndex = this.mockVehicles.findIndex(v => v.id === id)
      
      if (vehicleIndex === -1) {
        return { vehicle: null, error: new Error('Vehículo no encontrado') }
      }

      // Actualizar datos
      this.mockVehicles[vehicleIndex] = {
        ...this.mockVehicles[vehicleIndex],
        ...updates,
        updated_at: new Date()
      }

      const vehicle = ModelFactory.createVehicle(this.mockVehicles[vehicleIndex])

      return {
        vehicle,
        error: null
      }
    } catch (error) {
      return {
        vehicle: null,
        error: error as Error
      }
    }
  }

  // Eliminar vehículo (cambiar estado a suspended)
  async deleteVehicle(id: string): Promise<{ error: Error | null }> {
    try {
      const vehicleIndex = this.mockVehicles.findIndex(v => v.id === id)
      
      if (vehicleIndex === -1) {
        return { error: new Error('Vehículo no encontrado') }
      }

      this.mockVehicles[vehicleIndex].status = VehicleStatus.PENDING
      this.mockVehicles[vehicleIndex].updated_at = new Date()

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Obtener favoritos del usuario (mock)
  async getUserFavorites(): Promise<{
    vehicles: VehicleWithDetails[]
    error: Error | null
  }> {
    try {
      // Mock: devolver el primer vehículo como favorito
      const favoriteVehicle = this.mockVehicles[0]
      if (favoriteVehicle) {
        const vehicle = ModelFactory.createVehicle(favoriteVehicle)
        const vehicleWithDetails: VehicleWithDetails = { vehicle }
        return {
          vehicles: [vehicleWithDetails],
          error: null
        }
      }

      return {
        vehicles: [],
        error: null
      }
    } catch (error) {
      return {
        vehicles: [],
        error: error as Error
      }
    }
  }

  // Toggle favorito (mock)
  async toggleFavorite(_vehicleId: string): Promise<{
    isFavorite: boolean
    error: Error | null
  }> {
    try {
      // Mock: siempre devuelve true
      return { isFavorite: true, error: null }
    } catch (error) {
      return { isFavorite: false, error: error as Error }
    }
  }
}

// Export singleton instance
export const vehicleService = VehicleService.getInstance()