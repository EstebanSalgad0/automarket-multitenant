import type { Database } from '../lib/database.types'

type Vehicle = Database['public']['Tables']['vehiculos']['Row']

export interface VehicleWithImages extends Vehicle {
  vehicle_images?: Array<{
    id: string
    image_url: string
    alt_text?: string
    is_primary: boolean
    sort_order: number
  }>
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
  tenantId?: string
}

export class VehicleService {
  private tenantId: string

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  // Servicio simplificado - solo funciones básicas
  async getVehicles(): Promise<{
    vehicles: Vehicle[]
    count: number
    error: Error | null
  }> {
    return {
      vehicles: [],
      count: 0,
      error: new Error('Servicio temporalmente deshabilitado')
    }
  }

  async getVehicleById(id: string): Promise<VehicleWithImages | null> {
    return null
  }

  async createVehicle(vehicleData: any): Promise<{ error: Error | null }> {
    return { error: new Error('Servicio temporalmente deshabilitado') }
  }

  async updateVehicle(id: string, updates: any): Promise<{ error: Error | null }> {
    return { error: new Error('Servicio temporalmente deshabilitado') }
  }

  async deleteVehicle(id: string): Promise<{ error: Error | null }> {
    return { error: new Error('Servicio temporalmente deshabilitado') }
  }

  async getUserVehicles(userId: string): Promise<{ vehicles: VehicleWithImages[], error: Error | null }> {
    return { vehicles: [], error: new Error('Servicio temporalmente deshabilitado') }
  }

  async updateVehicleStatus(id: string, status: string): Promise<{ error: Error | null }> {
    return { error: new Error('Servicio temporalmente deshabilitado') }
  }
}

// Exportar una instancia por defecto que se puede usar cuando se tiene el tenant_id
export const createVehicleService = (tenantId: string) => new VehicleService(tenantId)
