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
          tenants (
            id,
            name,
            slug
          ),
          branches (
            id,
            name,
            city,
            region
          )
        `, { count: 'exact', head: false })
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // RLS (Row Level Security) maneja automáticamente el filtro de tenant
      // No necesitamos filtrar manualmente

      // Aplicar filtros
      if (filters.brand) {
        query = query.ilike('make', `%${filters.brand}%`)
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

      // RLS maneja automáticamente el filtro de tenant

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
      // @ts-ignore - Supabase types issue
      const { data, error } = await this.supabaseClient.supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          tenant_id: this.supabaseClient.tenant,
          seller_id: (await this.supabaseClient.supabase.auth.getUser()).data.user?.id
        } as any)
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
      // RLS maneja automáticamente el filtro de tenant
      // @ts-ignore - Supabase types issue
      const { data, error } = await this.supabaseClient.supabase
        .from('vehicles')
        // @ts-ignore
        .update(updates as any)
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
      // RLS maneja automáticamente el filtro de tenant
      // @ts-ignore - Supabase types issue
      const { error } = await this.supabaseClient.supabase
        .from('vehicles')
        // @ts-ignore
        .update({ status: 'suspended' } as any)
        .eq('id', id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Incrementar vistas
  private async incrementViews(vehicleId: string): Promise<void> {
    try {
      // @ts-ignore - RPC function not in generated types
      await this.supabaseClient.supabase.rpc('increment', {
        table_name: 'vehicles',
        row_id: vehicleId,
        column_name: 'views_count'
      })
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
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

        // @ts-ignore - RPC function not in generated types
        const { error: rpcError } = await this.supabaseClient.supabase.rpc(
          'adjust_vehicle_favorites',
          // @ts-ignore
          {
            vehicle_id: vehicleId,
            delta: -1,
          }
        )

        if (rpcError) console.error('Error adjusting favorites:', rpcError)

        return { isFavorite: false, error: null }
      } else {
        // Añadir a favoritos
        // @ts-ignore - Supabase types issue
        const { error } = await this.supabaseClient.supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            vehicle_id: vehicleId
          } as any)

        if (error) throw error

        // @ts-ignore - RPC function not in generated types
        const { error: rpcError } = await this.supabaseClient.supabase.rpc(
          'adjust_vehicle_favorites',
          // @ts-ignore
          {
            vehicle_id: vehicleId,
            delta: 1,
          }
        )

        if (rpcError) console.error('Error adjusting favorites:', rpcError)

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

  // Obtener vehículos de un usuario específico (vendedor)
  async getUserVehicles(userId: string): Promise<{
    vehicles: VehicleWithImages[]
    error: Error | null
  }> {
    try {
      const { supabase } = getSupabaseWithTenant()

      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
        `)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        vehicles: (data as VehicleWithImages[]) || [],
        error: null
      }
    } catch (error) {
      console.error('Error fetching user vehicles:', error)
      return {
        vehicles: [],
        error: error as Error
      }
    }
  }

  // ==========================================
  // MÉTODOS ADICIONALES PARA GESTIÓN
  // ==========================================

  // Subir imágenes del vehículo
  async uploadVehicleImages(vehicleId: string, imageFiles: File[]): Promise<{
    images: Array<{ id: string; image_url: string; is_primary: boolean }>
    error: Error | null
  }> {
    try {
      const { supabase } = getSupabaseWithTenant()
      const uploadedImages = []

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const fileName = `${vehicleId}/${Date.now()}-${file.name}`
        
        // Subir archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('vehicle-images')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          continue
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(fileName)

        // Crear registro en vehicle_images
        const { data: imageData, error: imageError } = await (supabase as any)
          .from('vehicle_images')
          .insert([{
            vehicle_id: vehicleId,
            image_url: publicUrl,
            is_primary: i === 0, // Primera imagen es primaria
            sort_order: i,
            alt_text: `${file.name} - Imagen ${i + 1}`
          }])
          .select()
          .single()

        if (imageError) {
          console.error('Error creating image record:', imageError)
          continue
        }

        uploadedImages.push(imageData)
      }

      return {
        images: uploadedImages,
        error: null
      }
    } catch (error) {
      console.error('Error uploading vehicle images:', error)
      return {
        images: [],
        error: error as Error
      }
    }
  }

  // Eliminar imagen específica
  async deleteVehicleImage(imageId: string): Promise<{
    success: boolean
    error: Error | null
  }> {
    try {
      const { supabase } = getSupabaseWithTenant()

      // Obtener información de la imagen
      const { data: imageData, error: fetchError } = await supabase
        .from('vehicle_images')
        .select('image_url')
        .eq('id', imageId)
        .single()

      if (fetchError) throw fetchError

      // Extraer nombre del archivo de la URL
      const url = (imageData as any).image_url
      const fileName = url.split('/').pop()?.split('?')[0]

      if (fileName) {
        // Eliminar archivo del storage
        await supabase.storage
          .from('vehicle-images')
          .remove([fileName])
      }

      // Eliminar registro de la base de datos
      const { error } = await (supabase as any)
        .from('vehicle_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      return {
        success: true,
        error: null
      }
    } catch (error) {
      console.error('Error deleting vehicle image:', error)
      return {
        success: false,
        error: error as Error
      }
    }
  }

  // Cambiar estado del vehículo
  async updateVehicleStatus(vehicleId: string, status: 'active' | 'sold' | 'reserved' | 'draft' | 'suspended'): Promise<{
    success: boolean
    error: Error | null
  }> {
    try {
      const { supabase } = getSupabaseWithTenant()

      const { error } = await (supabase as any)
        .from('vehicles')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)

      if (error) throw error

      return {
        success: true,
        error: null
      }
    } catch (error) {
      console.error('Error updating vehicle status:', error)
      return {
        success: false,
        error: error as Error
      }
    }
  }
}

// Export singleton instance
export const vehicleService = VehicleService.getInstance()

