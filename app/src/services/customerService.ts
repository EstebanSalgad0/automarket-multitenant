import { supabase } from '../lib/supabase'

// Tipos temporales para bypass de TypeScript hasta actualizar la configuración de Supabase
const supabaseClient = supabase as any

export interface VehicleSearchFilters {
  brand?: string
  model?: string
  yearFrom?: number
  yearTo?: number
  min_year?: number
  priceFrom?: number
  priceTo?: number
  max_price?: number
  mileageFrom?: number
  mileageTo?: number
  condition_type?: 'new' | 'used' | 'certified_pre_owned'
  body_type?: 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'convertible' | 'coupe' | 'wagon'
  fuel_type?: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other'
  transmission?: 'manual' | 'automatic' | 'cvt'
  color?: string
  location?: string
  tenant_id?: string
}

export interface VehicleData {
  id: string
  brand: string
  model: string
  year: number
  price: number
  mileage?: number
  condition_type: string
  body_type?: string
  fuel_type?: string
  transmission?: string
  color?: string
  description?: string
  features: string[]
  status: string
  views_count: number
  favorites_count: number
  created_at: string
  updated_at: string
  seller_id: string
  tenant_id: string
  branch_id?: string
  vin?: string
  // Datos del vendedor y sucursal
  seller?: {
    id: string
    email: string
    role: string
    full_name?: string
    user_profiles?: {
      first_name: string
      last_name: string
      phone?: string
    }
  }
  branch?: {
    id: string
    name: string
    address: string
    phone: string
    email: string
  }
  images?: VehicleImage[]
}

export interface VehicleImage {
  id: string
  vehicle_id: string
  image_url: string
  alt_text?: string
  is_primary: boolean
  display_order: number
}

export interface CustomerFavorite {
  id: string
  customer_id: string
  vehicle_id: string
  created_at: string
  vehicle?: VehicleData
}

export interface CustomerLead {
  id: string
  customer_id: string
  vehicle_id: string
  seller_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  message: string
  status: 'new' | 'contacted' | 'interested' | 'not_interested' | 'sold' | 'pending' | 'closed'
  lead_source?: 'catalog' | 'favorites' | 'detail' | 'application'
  seller_response?: string
  created_at: string
  updated_at: string
  vehicle?: VehicleData
}

export interface CustomerProfile {
  user_id: string
  first_name: string
  last_name: string
  phone?: string
  email: string
  avatar_url?: string
  date_of_birth?: string
  city?: string
  state?: string
  region?: string
  preferred_brands?: string[]
  preferred_price_min?: number
  preferred_price_max?: number
  preferred_body_types?: string[]
  preferences?: {
    notification_settings?: {
      email_new_matches: boolean
      email_price_drops: boolean
      sms_notifications: boolean
    }
  }
  created_at: string
  updated_at: string
}

export interface SearchResult {
  vehicles: VehicleData[]
  total: number
  total_count: number
  filters_applied: VehicleSearchFilters
  page: number
  per_page: number
}

export class CustomerService {
  private static instance: CustomerService

  static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService()
    }
    return CustomerService.instance
  }

  /**
   * Buscar vehículos con filtros
   */
  async searchVehicles(filters: VehicleSearchFilters, page: number = 1, perPage: number = 20): Promise<SearchResult> {
    try {
      let query = supabaseClient
        .from('vehicles')
        .select(`
          *,
          seller:users!vehicles_seller_id_fkey(
            id, email, role, full_name,
            user_profiles(first_name, last_name, phone)
          ),
          branch:branches(id, name, address, phone, email),
          vehicle_images(id, image_url, alt_text, is_primary, display_order)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id)
      }
      
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`)
      }
      
      if (filters.model) {
        query = query.ilike('model', `%${filters.model}%`)
      }
      
      if (filters.yearFrom) {
        query = query.gte('year', filters.yearFrom)
      }
      
      if (filters.yearTo) {
        query = query.lte('year', filters.yearTo)
      }
      
      if (filters.priceFrom) {
        query = query.gte('price', filters.priceFrom)
      }
      
      if (filters.priceTo) {
        query = query.lte('price', filters.priceTo)
      }
      
      if (filters.mileageFrom) {
        query = query.gte('mileage', filters.mileageFrom)
      }
      
      if (filters.mileageTo) {
        query = query.lte('mileage', filters.mileageTo)
      }
      
      if (filters.condition_type) {
        query = query.eq('condition_type', filters.condition_type)
      }
      
      if (filters.body_type) {
        query = query.eq('body_type', filters.body_type)
      }
      
      if (filters.fuel_type) {
        query = query.eq('fuel_type', filters.fuel_type)
      }
      
      if (filters.transmission) {
        query = query.eq('transmission', filters.transmission)
      }
      
      if (filters.color) {
        query = query.ilike('color', `%${filters.color}%`)
      }

      // Paginación
      const from = (page - 1) * perPage
      const to = from + perPage - 1
      
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Error searching vehicles:', error)
        return {
          vehicles: [],
          total: 0,
          total_count: 0,
          filters_applied: filters,
          page,
          per_page: perPage
        }
      }

      return {
        vehicles: data || [],
        total: count || 0,
        total_count: count || 0,
        filters_applied: filters,
        page,
        per_page: perPage
      }

    } catch (error) {
      console.error('Error in searchVehicles:', error)
      return {
        vehicles: [],
        total: 0,
        total_count: 0,
        filters_applied: filters,
        page,
        per_page: perPage
      }
    }
  }

  /**
   * Obtener detalles completos de un vehículo
   */
  async getVehicleDetails(vehicleId: string): Promise<VehicleData | null> {
    try {
      const { data, error } = await supabaseClient
        .from('vehicles')
        .select(`
          *,
          seller:users!vehicles_seller_id_fkey(
            id, email, role, full_name,
            user_profiles(first_name, last_name, phone)
          ),
          branch:branches(id, name, address, phone, email),
          vehicle_images(id, image_url, alt_text, is_primary, display_order)
        `)
        .eq('id', vehicleId)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Error fetching vehicle details:', error)
        return null
      }

      // Incrementar contador de vistas
      await this.incrementVehicleViews(vehicleId)

      return data
    } catch (error) {
      console.error('Error in getVehicleDetails:', error)
      return null
    }
  }

  /**
   * Incrementar contador de vistas de un vehículo
   */
  async incrementVehicleViews(vehicleId: string): Promise<void> {
    try {
      const { error } = await supabaseClient.rpc('adjust_vehicle_views', {
        vehicle_id: vehicleId,
        delta: 1
      })

      if (error) {
        console.error('Error incrementing vehicle views:', error)
      }
    } catch (error) {
      console.error('Error in incrementVehicleViews:', error)
    }
  }

  /**
   * Obtener vehículos favoritos del cliente
   */
  async getCustomerFavorites(customerId: string): Promise<CustomerFavorite[]> {
    try {
      const { data, error } = await supabaseClient
        .from('customer_favorites')
        .select(`
          *,
          vehicle:vehicles(
            id, brand, model, year, price, mileage, condition_type,
            status, views_count, favorites_count,
            vehicle_images(id, image_url, is_primary)
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customer favorites:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCustomerFavorites:', error)
      return []
    }
  }

  /**
   * Agregar vehículo a favoritos
   */
  async addToFavorites(customerId: string, vehicleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar si ya está en favoritos
      const { data: existing } = await supabaseClient
        .from('customer_favorites')
        .select('id')
        .eq('customer_id', customerId)
        .eq('vehicle_id', vehicleId)
        .single()

      if (existing) {
        return { success: false, error: 'El vehículo ya está en favoritos' }
      }

      const { error } = await supabaseClient
        .from('customer_favorites')
        .insert({
          customer_id: customerId,
          vehicle_id: vehicleId
        })

      if (error) {
        console.error('Error adding to favorites:', error)
        return { success: false, error: 'Error agregando a favoritos' }
      }

      // Incrementar contador de favoritos del vehículo
      await supabaseClient.rpc('adjust_vehicle_favorites', {
        vehicle_id: vehicleId,
        delta: 1
      })

      return { success: true }
    } catch (error) {
      console.error('Error in addToFavorites:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Remover vehículo de favoritos
   */
  async removeFromFavorites(customerId: string, vehicleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseClient
        .from('customer_favorites')
        .delete()
        .eq('customer_id', customerId)
        .eq('vehicle_id', vehicleId)

      if (error) {
        console.error('Error removing from favorites:', error)
        return { success: false, error: 'Error removiendo de favoritos' }
      }

      // Decrementar contador de favoritos del vehículo
      await supabaseClient.rpc('adjust_vehicle_favorites', {
        vehicle_id: vehicleId,
        delta: -1
      })

      return { success: true }
    } catch (error) {
      console.error('Error in removeFromFavorites:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener vehículos favoritos del cliente
   */
  async getFavorites(customerId: string): Promise<VehicleData[]> {
    try {
      const { data, error } = await supabaseClient
        .from('customer_favorites')
        .select(`
          vehicle_id,
          created_at,
          vehicles (
            id,
            brand,
            model,
            year,
            price,
            mileage,
            condition_type,
            body_type,
            fuel_type,
            transmission,
            color,
            description,
            features,
            status,
            views_count,
            favorites_count,
            created_at,
            updated_at,
            seller_id,
            tenant_id,
            branch_id,
            vin
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting favorites:', error)
        return []
      }

      // Mapear los datos para extraer los vehículos
      const vehicles = (data || [])
        .map((favorite: any) => favorite.vehicles)
        .filter((vehicle: any) => vehicle !== null)
        .map((vehicle: any) => ({
          ...vehicle,
          features: vehicle.features || []
        }))

      return vehicles as VehicleData[]
    } catch (error) {
      console.error('Error in getFavorites:', error)
      return []
    }
  }

  /**
   * Crear lead/contacto con vendedor
   */
  async createLead(leadData: {
    customer_id: string
    vehicle_id: string
    seller_id?: string
    customer_name: string
    customer_email: string
    customer_phone?: string
    message: string
    lead_source?: 'catalog' | 'favorites' | 'detail' | 'application'
  }): Promise<{ success: boolean; lead?: CustomerLead; error?: string }> {
    try {
      const { data, error } = await supabaseClient
        .from('customer_leads')
        .insert({
          customer_id: leadData.customer_id,
          vehicle_id: leadData.vehicle_id,
          seller_id: leadData.seller_id || '',
          customer_name: leadData.customer_name,
          customer_email: leadData.customer_email,
          customer_phone: leadData.customer_phone,
          message: leadData.message,
          lead_source: leadData.lead_source || 'application',
          status: 'new'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating lead:', error)
        return { success: false, error: 'Error creando consulta' }
      }

      return { success: true, lead: data }
    } catch (error) {
      console.error('Error in createLead:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener leads del cliente
   */
  async getCustomerLeads(customerId: string): Promise<CustomerLead[]> {
    try {
      const { data, error } = await supabaseClient
        .from('customer_leads')
        .select(`
          *,
          vehicle:vehicles(
            id, brand, model, year, price,
            vehicle_images(id, image_url, is_primary)
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customer leads:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCustomerLeads:', error)
      return []
    }
  }

  /**
   * Obtener perfil del cliente
   */
  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select(`
          *,
          user_profiles(*)
        `)
        .eq('id', customerId)
        .single()

      if (error) {
        console.error('Error fetching customer profile:', error)
        return null
      }

      return {
        user_id: data.id,
        first_name: data.user_profiles?.first_name || '',
        last_name: data.user_profiles?.last_name || '',
        phone: data.user_profiles?.phone,
        email: data.email,
        avatar_url: data.user_profiles?.avatar_url,
        date_of_birth: data.user_profiles?.date_of_birth,
        city: data.user_profiles?.city,
        state: data.user_profiles?.state,
        preferences: data.preferences || {},
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error) {
      console.error('Error in getCustomerProfile:', error)
      return null
    }
  }

  /**
   * Actualizar perfil del cliente
   */
  async updateCustomerProfile(customerId: string, profileData: Partial<CustomerProfile>): Promise<CustomerProfile> {
    try {
      // Actualizar tabla users
      if (profileData.email || profileData.preferences) {
        const userUpdates: any = {}
        if (profileData.email) userUpdates.email = profileData.email
        if (profileData.preferences) userUpdates.preferences = profileData.preferences

        const { error: userError } = await supabaseClient
          .from('users')
          .update(userUpdates)
          .eq('id', customerId)

        if (userError) {
          console.error('Error updating user:', userError)
          throw new Error('Error actualizando información de usuario')
        }
      }

      // Actualizar tabla user_profiles
      const profileUpdates: any = {}
      if (profileData.first_name !== undefined) profileUpdates.first_name = profileData.first_name
      if (profileData.last_name !== undefined) profileUpdates.last_name = profileData.last_name
      if (profileData.phone !== undefined) profileUpdates.phone = profileData.phone
      if (profileData.avatar_url !== undefined) profileUpdates.avatar_url = profileData.avatar_url
      if (profileData.date_of_birth !== undefined) profileUpdates.date_of_birth = profileData.date_of_birth
      if (profileData.city !== undefined) profileUpdates.city = profileData.city
      if (profileData.state !== undefined) profileUpdates.state = profileData.state
      if (profileData.region !== undefined) profileUpdates.region = profileData.region
      if (profileData.preferred_brands !== undefined) profileUpdates.preferred_brands = profileData.preferred_brands
      if (profileData.preferred_price_min !== undefined) profileUpdates.preferred_price_min = profileData.preferred_price_min
      if (profileData.preferred_price_max !== undefined) profileUpdates.preferred_price_max = profileData.preferred_price_max
      if (profileData.preferred_body_types !== undefined) profileUpdates.preferred_body_types = profileData.preferred_body_types

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabaseClient
          .from('user_profiles')
          .update(profileUpdates)
          .eq('user_id', customerId)

        if (profileError) {
          console.error('Error updating user profile:', profileError)
          throw new Error('Error actualizando perfil')
        }
      }

      // Devolver perfil actualizado
      const updatedProfile = await this.getCustomerProfile(customerId)
      if (!updatedProfile) {
        throw new Error('Error obteniendo perfil actualizado')
      }
      return updatedProfile
    } catch (error) {
      console.error('Error in updateCustomerProfile:', error)
      throw error
    }
  }

  /**
   * Obtener marcas disponibles
   */
  async getAvailableBrands(tenantId?: string): Promise<string[]> {
    try {
      let query = supabaseClient
        .from('vehicles')
        .select('brand')
        .eq('status', 'active')

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching brands:', error)
        return []
      }

      const brands = [...new Set(data?.map((v: any) => v.brand).filter(Boolean) || [])] as string[]
      return brands.sort()
    } catch (error) {
      console.error('Error in getAvailableBrands:', error)
      return []
    }
  }

  /**
   * Obtener rango de precios disponible
   */
  async getPriceRange(tenantId?: string): Promise<{ min: number; max: number }> {
    try {
      let query = supabaseClient
        .from('vehicles')
        .select('price')
        .eq('status', 'active')

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error || !data?.length) {
        return { min: 0, max: 100000000 }
      }

      const prices = data.map((v: any) => v.price)
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    } catch (error) {
      console.error('Error in getPriceRange:', error)
      return { min: 0, max: 100000000 }
    }
  }
}

// Exportar instancia singleton
export const customerService = CustomerService.getInstance()