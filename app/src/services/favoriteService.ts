import { getSupabaseWithTenant } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Favorite = Database['public']['Tables']['favorites']['Row']
type FavoriteInsert = Database['public']['Tables']['favorites']['Insert']

export interface FavoriteWithDetails extends Favorite {
  vehicle?: {
    id: string
    brand: string
    model: string
    year: number
    price: number
    images?: string[]
    status: string
    branch_id: string
    branch?: {
      name: string
      city: string
    }
  }
}

export interface FavoriteFilters {
  user_id?: string
  vehicle_ids?: string[]
  date_from?: string
  date_to?: string
}

export const favoriteService = {
  async getFavorites(filters: FavoriteFilters = {}): Promise<FavoriteWithDetails[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      let query = supabase
        .from('favorites')
        .select(`
          *,
          vehicle:vehicles!vehicle_id(
            id,
            brand,
            model,
            year,
            price,
            images,
            status,
            branch_id,
            branch:branches!branch_id(name, city)
          )
        `)
        .order('created_at', { ascending: false })

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters.vehicle_ids && filters.vehicle_ids.length > 0) {
        query = query.in('vehicle_id', filters.vehicle_ids)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching favorites:', error)
        throw new Error(`Error fetching favorites: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Favorite service error:', error)
      throw error
    }
  },

  async getUserFavorites(userId: string): Promise<FavoriteWithDetails[]> {
    return this.getFavorites({ user_id: userId })
  },

  async checkIsFavorite(userId: string, vehicleId: string): Promise<boolean> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('vehicle_id', vehicleId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return false // No encontrado
        console.error('Error checking favorite:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Check favorite error:', error)
      return false
    }
  },

  async addFavorite(userId: string, vehicleId: string): Promise<Favorite> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const favoriteData: FavoriteInsert = {
        user_id: userId,
        vehicle_id: vehicleId,
        tenant_id: 'default' // TODO: obtener tenant_id correctamente
      }

      const { data, error } = await (supabase as any)
        .from('favorites')
        .insert([favoriteData])
        .select()
        .single()

      if (error) {
        console.error('Error adding favorite:', error)
        throw new Error(`Error adding favorite: ${error.message}`)
      }

      // Incrementar contador de favoritos del vehículo
      await this.updateVehicleFavoriteCount(vehicleId, 1)

      return data
    } catch (error) {
      console.error('Add favorite error:', error)
      throw error
    }
  },

  async removeFavorite(userId: string, vehicleId: string): Promise<void> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('vehicle_id', vehicleId)

      if (error) {
        console.error('Error removing favorite:', error)
        throw new Error(`Error removing favorite: ${error.message}`)
      }

      // Decrementar contador de favoritos del vehículo
      await this.updateVehicleFavoriteCount(vehicleId, -1)
    } catch (error) {
      console.error('Remove favorite error:', error)
      throw error
    }
  },

  async toggleFavorite(userId: string, vehicleId: string): Promise<{ isFavorite: boolean; favorite?: Favorite }> {
    try {
      const isFavorite = await this.checkIsFavorite(userId, vehicleId)

      if (isFavorite) {
        await this.removeFavorite(userId, vehicleId)
        return { isFavorite: false }
      } else {
        const favorite = await this.addFavorite(userId, vehicleId)
        return { isFavorite: true, favorite }
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
      throw error
    }
  },

  async getFavoriteCount(vehicleId: string): Promise<number> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('vehicle_id', vehicleId)

      if (error) {
        console.error('Error counting favorites:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Favorite count error:', error)
      return 0
    }
  },

  async updateVehicleFavoriteCount(vehicleId: string, increment: number): Promise<void> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      // Obtener el conteo actual
      const currentCount = await this.getFavoriteCount(vehicleId)
      const newCount = Math.max(0, currentCount + increment)

      // Actualizar el vehículo (asumir que hay un campo favorite_count)
      const { error } = await (supabase as any)
        .from('vehicles')
        .update({ favorite_count: newCount })
        .eq('id', vehicleId)

      if (error && !error.message.includes('column "favorite_count" does not exist')) {
        console.error('Error updating vehicle favorite count:', error)
        // No lanzar error para no interrumpir el flujo principal
      }
    } catch (error) {
      console.error('Update vehicle favorite count error:', error)
      // No lanzar error para no interrumpir el flujo principal
    }
  },

  async getFavoritesByVehicle(vehicleId: string): Promise<FavoriteWithDetails[]> {
    return this.getFavorites({ vehicle_ids: [vehicleId] })
  },

  async getMostFavoriteVehicles(limit: number = 10): Promise<{ vehicle_id: string; favorite_count: number }[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('favorites')
        .select('vehicle_id')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching most favorite vehicles:', error)
        return []
      }

      // Contar favoritos por vehículo
      const vehicleCounts: { [key: string]: number } = {}
      
      data?.forEach((favorite: any) => {
        const vehicleId = favorite.vehicle_id
        vehicleCounts[vehicleId] = (vehicleCounts[vehicleId] || 0) + 1
      })

      // Convertir a array y ordenar
      const sortedVehicles = Object.entries(vehicleCounts)
        .map(([vehicle_id, favorite_count]) => ({ vehicle_id, favorite_count }))
        .sort((a, b) => b.favorite_count - a.favorite_count)
        .slice(0, limit)

      return sortedVehicles
    } catch (error) {
      console.error('Most favorite vehicles error:', error)
      return []
    }
  },

  async getUserFavoriteStats(userId: string): Promise<{
    total_favorites: number
    favorite_brands: { brand: string; count: number }[]
    favorite_price_range: { min: number; max: number; avg: number }
  }> {
    try {
      const favorites = await this.getUserFavorites(userId)
      
      const totalFavorites = favorites.length
      const brandCounts: { [key: string]: number } = {}
      const prices: number[] = []

      favorites.forEach(favorite => {
        if (favorite.vehicle) {
          const brand = favorite.vehicle.brand
          brandCounts[brand] = (brandCounts[brand] || 0) + 1
          prices.push(favorite.vehicle.price)
        }
      })

      const favoriteBrands = Object.entries(brandCounts)
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count)

      const priceStats = prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
      } : { min: 0, max: 0, avg: 0 }

      return {
        total_favorites: totalFavorites,
        favorite_brands: favoriteBrands,
        favorite_price_range: priceStats
      }
    } catch (error) {
      console.error('User favorite stats error:', error)
      return {
        total_favorites: 0,
        favorite_brands: [],
        favorite_price_range: { min: 0, max: 0, avg: 0 }
      }
    }
  },

  async clearUserFavorites(userId: string): Promise<void> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error clearing user favorites:', error)
        throw new Error(`Error clearing user favorites: ${error.message}`)
      }
    } catch (error) {
      console.error('Clear user favorites error:', error)
      throw error
    }
  }
}