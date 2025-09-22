import { getSupabaseWithTenant } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Vehicle = Database['public']['Tables']['vehicles']['Row']
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']

export interface VehicleWithImages extends Vehicle {
  vehicle_images: Array<{
    id: string
    image_url: string
    alt_text?: string
    is_primary: boolean
    sort_order: number
  }>
  seller_profile?: {
    first_name: string
    last_name: string
    rating: number
    rating_count: number
  }
  dealer_profile?: {
    company_name: string
    logo_url?: string
    verified_at?: string
  }
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
  private supabaseClient = getSupabaseWithTenant()

  static getInstance(): VehicleService {
    if (!VehicleService.instance) {
      VehicleService.instance = new VehicleService()
    }
    return VehicleService.instance
  }

  // Obtener vehículos con filtros
  async getVehicles(filters: VehicleFilters = {}, limit = 20, offset = 0): Promise<{
    vehicles: VehicleWithImages[]
    count: number
    error: Error | null
  }> {
    try {
      let query = this.supabaseClient.supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          ),
          seller:users!seller_id (
            user_profiles (
              first_name,
              last_name,
              rating,
              rating_count
            ),
            dealer_profiles (
              company_name,
              logo_url,
              verified_at
            )
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Aplicar filtro de tenant
      query = this.supabaseClient.withTenant(query)

      // Aplicar filtros
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`)
      }
      if (filters.model) {
        query = query.ilike('model', `%${filters.model}%`)
      }
      if (filters.yearMin) {
        query = query.gte('year', filters.yearMin)
      }
      if (filters.yearMax) {
        query = query.lte('year', filters.yearMax)
      }
      if (filters.priceMin) {
        query = query.gte('price', filters.priceMin)
      }
      if (filters.priceMax) {
        query = query.lte('price', filters.priceMax)
      }
      if (filters.bodyType) {
        query = query.eq('body_type', filters.bodyType)
      }
      if (filters.fuelType) {
        query = query.eq('fuel_type', filters.fuelType)
      }
      if (filters.transmission) {
        query = query.eq('transmission', filters.transmission)
      }
      if (filters.condition) {
        query = query.eq('condition_type', filters.condition)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        vehicles: data as VehicleWithImages[],
        count: count || 0,
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
    vehicle: VehicleWithImages | null
    error: Error | null
  }> {
    try {
      let query = this.supabaseClient.supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          ),
          seller:users!seller_id (
            user_profiles (
              first_name,
              last_name,
              rating,
              rating_count
            ),
            dealer_profiles (
              company_name,
              logo_url,
              verified_at
            )
          )
        `)
        .eq('id', id)
        .single()

      // Aplicar filtro de tenant
      query = this.supabaseClient.withTenant(query)

      const { data, error } = await query

      if (error) throw error

      // Incrementar contador de vistas
      await this.incrementViews(id)

      return {
        vehicle: data as VehicleWithImages,
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
  async createVehicle(vehicleData: Omit<VehicleInsert, 'tenant_id' | 'seller_id'>): Promise<{
    vehicle: Vehicle | null
    error: Error | null
  }> {
    try {
      const { data, error } = await this.supabaseClient.supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          tenant_id: this.supabaseClient.tenant,
          seller_id: (await this.supabaseClient.supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error

      return {
        vehicle: data,
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
  async updateVehicle(id: string, updates: VehicleUpdate): Promise<{
    vehicle: Vehicle | null
    error: Error | null
  }> {
    try {
      const { data, error } = await this.supabaseClient.supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        vehicle: data,
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
      const { error } = await this.supabaseClient.supabase
        .from('vehicles')
        .update({ status: 'suspended' })
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Incrementar vistas
  private async incrementViews(vehicleId: string): Promise<void> {
    await this.supabaseClient.supabase.rpc('increment', {
      table_name: 'vehicles',
      row_id: vehicleId,
      column_name: 'views_count'
    })
  }

  // Gestión de favoritos
  async toggleFavorite(vehicleId: string): Promise<{
    isFavorite: boolean
    error: Error | null
  }> {
    try {
      const user = (await this.supabaseClient.supabase.auth.getUser()).data.user
      if (!user) throw new Error('Usuario no autenticado')

      // Verificar si ya está en favoritos
      const { data: existing } = await this.supabaseClient.supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('vehicle_id', vehicleId)
        .single()

      if (existing) {
        // Remover de favoritos
        const { error } = await this.supabaseClient.supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('vehicle_id', vehicleId)

        if (error) throw error

        // Decrementar contador
        await this.supabaseClient.supabase
          .from('vehicles')
          .update({ 
            favorites_count: this.supabaseClient.supabase.sql`favorites_count - 1` 
          })
          .eq('id', vehicleId)

        return { isFavorite: false, error: null }
      } else {
        // Añadir a favoritos
        const { error } = await this.supabaseClient.supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            vehicle_id: vehicleId
          })

        if (error) throw error

        // Incrementar contador
        await this.supabaseClient.supabase
          .from('vehicles')
          .update({ 
            favorites_count: this.supabaseClient.supabase.sql`favorites_count + 1` 
          })
          .eq('id', vehicleId)

        return { isFavorite: true, error: null }
      }
    } catch (error) {
      return { isFavorite: false, error: error as Error }
    }
  }

  // Obtener favoritos del usuario
  async getUserFavorites(): Promise<{
    vehicles: VehicleWithImages[]
    error: Error | null
  }> {
    try {
      const user = (await this.supabaseClient.supabase.auth.getUser()).data.user
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await this.supabaseClient.supabase
        .from('user_favorites')
        .select(`
          vehicle_id,
          vehicles (
            *,
            vehicle_images (
              id,
              image_url,
              alt_text,
              is_primary,
              sort_order
            )
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vehicles = data?.map((item: any) => item.vehicles).filter(Boolean) as VehicleWithImages[]

      return {
        vehicles,
        error: null
      }
    } catch (error) {
      return {
        vehicles: [],
        error: error as Error
      }
    }
  }
}

// Export singleton instance
export const vehicleService = VehicleService.getInstance()
