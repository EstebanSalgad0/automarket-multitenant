import { supabase } from '../lib/supabase'

/**
 * Helper para obtener el tenant_id desde un slug
 */
async function getTenantIdFromSlug(slug: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    
    if (error) {
      console.error('Error obteniendo tenant por slug:', error)
      return null
    }
    
    if (!data) {
      console.warn(`No se encontró tenant con slug: ${slug}`)
      return null
    }
    
    return (data as { id: string }).id
  } catch (err) {
    console.error('Error en getTenantIdFromSlug:', err)
    return null
  }
}

// Tipos para las estadísticas del dashboard
export interface DashboardStats {
  totalVehicles: number
  activeVehicles: number
  soldVehicles: number
  totalViews: number
  totalFavorites: number
  totalLeads: number
  revenueThisMonth: number
  conversionRate: number
}

export interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: string
  mileage?: number
  condition_type?: string
  views_count: number
  favorites_count: number
  created_at: string
  updated_at: string
  tenant_id: string
  seller_id: string
}

export interface VehicleStats {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: string
  mileage?: number
  condition_type?: string
  views_count: number
  favorites_count: number
  created_at: string
  updated_at: string
}

export interface LeadStats {
  id: string
  vehicle_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  status: string
  created_at: string
  vehicle?: {
    make: string
    model: string
    price: number
  }
}

export interface UserData {
  id: string
  email: string
  role: string
}

export interface UserProfile {
  first_name: string
  last_name: string
}

export interface TeamMemberStats {
  id: string
  full_name: string
  email: string
  role: string
  vehicles_count: number
  sales_count: number
  total_revenue: number
}

export interface SalesTrend {
  month: string
  sales: number
  revenue: number
}

/**
 * Dashboard Service
 * Servicio centralizado para obtener datos reales de los dashboards
 */
export class DashboardService {
  private static instance: DashboardService

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService()
    }
    return DashboardService.instance
  }

  /**
   * Obtener estadísticas generales del dashboard
   * Para: Corporate Admin, Dealer, Seller
   */
  async getDashboardStats(userId?: string, tenantSlug?: string): Promise<DashboardStats> {
    try {
      // Primero, obtener el tenant_id desde el slug
      let tenantId: string | null = null
      
      if (tenantSlug) {
        tenantId = await getTenantIdFromSlug(tenantSlug)
        console.log('🔍 Tenant resuelto:', { slug: tenantSlug, id: tenantId })
      }

      let query = supabase.from('vehicles').select('*', { count: 'exact' })

      // Filtrar por tenant si se encontró el ID
      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      // Filtrar por usuario si se especifica (para sellers individuales)
      if (userId) {
        query = query.eq('seller_id', userId)
      }

      const { data, count, error } = await query

      if (error) {
        console.error('Error fetching vehicles:', error)
        throw error
      }

      // Tipado explícito para los vehículos
      const vehicles = (data || []) as VehicleData[]

      console.log('📊 Dashboard Stats - Datos obtenidos:', {
        tenantSlug,
        tenantId,
        totalVehicles: count,
        vehiclesData: vehicles.length
      })

      // Calcular estadísticas
      const stats: DashboardStats = {
        totalVehicles: count || 0,
        activeVehicles: vehicles?.filter((v: VehicleData) => v.status === 'available').length || 0,
        soldVehicles: vehicles?.filter((v: VehicleData) => v.status === 'sold').length || 0,
        totalViews: vehicles?.reduce((sum: number, v: VehicleData) => sum + (v.views_count || 0), 0) || 0,
        totalFavorites: vehicles?.reduce((sum: number, v: VehicleData) => sum + (v.favorites_count || 0), 0) || 0,
        totalLeads: 0, // Se calculará después
        revenueThisMonth: 0, // Se calculará después
        conversionRate: 0
      }

      // Calcular tasa de conversión
      if (stats.totalVehicles > 0) {
        stats.conversionRate = (stats.soldVehicles / stats.totalVehicles) * 100
      }

      // Obtener leads (si existe la tabla)
      try {
        let leadsQuery = supabase.from('leads').select('*', { count: 'exact' })
        
        if (userId) {
          leadsQuery = leadsQuery.eq('assigned_to', userId)
        } else if (tenantId) {
          leadsQuery = leadsQuery.eq('tenant_id', tenantId)
        }

        const { count: leadsCount } = await leadsQuery
        stats.totalLeads = leadsCount || 0
      } catch {
        // Tabla leads no disponible aún
        console.warn('Tabla leads no disponible aún')
      }

      // Calcular ingresos del mes actual
      const soldThisMonth = vehicles?.filter((v: VehicleData) => {
        if (v.status !== 'sold') return false
        const soldDate = new Date(v.updated_at)
        const now = new Date()
        return soldDate.getMonth() === now.getMonth() && 
               soldDate.getFullYear() === now.getFullYear()
      }) || []

      stats.revenueThisMonth = soldThisMonth.reduce((sum: number, v: VehicleData) => sum + (v.price || 0), 0)

      return stats
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return {
        totalVehicles: 0,
        activeVehicles: 0,
        soldVehicles: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalLeads: 0,
        revenueThisMonth: 0,
        conversionRate: 0
      }
    }
  }

  /**
   * Obtener vehículos con estadísticas
   * Para mostrar en el dashboard
   */
  async getVehiclesWithStats(userId?: string, tenantSlug?: string, limit = 10): Promise<VehicleStats[]> {
    try {
      // Resolver tenant_id desde el slug
      let tenantId: string | null = null
      
      if (tenantSlug) {
        tenantId = await getTenantIdFromSlug(tenantSlug)
      }

      let query = supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      if (userId) {
        query = query.eq('seller_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []) as VehicleStats[]
    } catch (error) {
      console.error('Error getting vehicles with stats:', error)
      return []
    }
  }

  /**
   * Obtener leads/contactos
   */
  async getLeads(userId?: string, tenantId?: string, limit = 10): Promise<LeadStats[]> {
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          vehicle:vehicles(make, model, price)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      if (userId) {
        query = query.eq('assigned_to', userId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []) as LeadStats[]
    } catch (error) {
      console.warn('Tabla leads no disponible aún:', error)
      return []
    }
  }

  /**
   * Obtener estadísticas del equipo
   * Para: Corporate Admin, Branch Manager
   */
  async getTeamStats(tenantSlug?: string): Promise<TeamMemberStats[]> {
    try {
      // Resolver tenant_id desde el slug
      let tenantId: string | null = null
      
      if (tenantSlug) {
        tenantId = await getTenantIdFromSlug(tenantSlug)
      }

      if (!tenantId) {
        console.warn('No tenant ID available for team stats')
        return []
      }

      // Obtener usuarios del tenant
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('tenant_id', tenantId)

      if (usersError) throw usersError

      // Tipar explícitamente los usuarios
      const typedUsers = (users || []) as UserData[]

      // Para cada usuario, obtener sus estadísticas
      const teamStats = await Promise.all(
        typedUsers.map(async (user: UserData) => {
          // Obtener perfil (puede no existir)
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .maybeSingle()  // Cambio: usar maybeSingle() en lugar de single()

          // Tipar el perfil
          const typedProfile = profile as UserProfile | null

          // Obtener vehículos
          const { data: vehicles } = await supabase
            .from('vehicles')
            .select('*')
            .eq('seller_id', user.id)

          const typedVehicles = (vehicles || []) as VehicleData[]
          const vehiclesCount = typedVehicles?.length || 0
          const salesCount = typedVehicles?.filter((v: VehicleData) => v.status === 'sold').length || 0
          const totalRevenue = typedVehicles
            ?.filter((v: VehicleData) => v.status === 'sold')
            .reduce((sum: number, v: VehicleData) => sum + (v.price || 0), 0) || 0

          return {
            id: user.id,
            full_name: typedProfile ? `${typedProfile.first_name} ${typedProfile.last_name}` : user.email,
            email: user.email,
            role: user.role || 'seller',
            vehicles_count: vehiclesCount,
            sales_count: salesCount,
            total_revenue: totalRevenue
          }
        })
      )

      return teamStats
    } catch (error) {
      console.error('Error getting team stats:', error)
      return []
    }
  }

  /**
   * Obtener vehículos más populares
   */
  async getTopVehicles(tenantSlug?: string, limit = 5): Promise<VehicleStats[]> {
    try {
      // Resolver tenant_id desde el slug
      let tenantId: string | null = null
      
      if (tenantSlug) {
        tenantId = await getTenantIdFromSlug(tenantSlug)
      }

      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('views_count', { ascending: false })
        .limit(limit)

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []) as VehicleStats[]
    } catch (error) {
      console.error('Error getting top vehicles:', error)
      return []
    }
  }

  /**
   * Obtener tendencias de ventas (últimos 6 meses)
   */
  async getSalesTrends(tenantSlug?: string): Promise<SalesTrend[]> {
    try {
      // Resolver tenant_id desde el slug
      let tenantId: string | null = null
      
      if (tenantSlug) {
        tenantId = await getTenantIdFromSlug(tenantSlug)
      }

      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'sold')

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data: soldVehicles, error } = await query

      if (error) throw error

      // Tipar explícitamente los vehículos vendidos
      const typedSoldVehicles = (soldVehicles || []) as VehicleData[]

      // Agrupar por mes
      const last6Months: SalesTrend[] = []
      const now = new Date()

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })

        const monthSales = typedSoldVehicles?.filter((v: VehicleData) => {
          const soldDate = new Date(v.updated_at)
          return soldDate.getMonth() === date.getMonth() && 
                 soldDate.getFullYear() === date.getFullYear()
        }) || []

        last6Months.push({
          month: monthName,
          sales: monthSales.length,
          revenue: monthSales.reduce((sum: number, v: VehicleData) => sum + (v.price || 0), 0)
        })
      }

      return last6Months
    } catch (error) {
      console.error('Error getting sales trends:', error)
      return []
    }
  }

  /**
   * Obtener información del tenant actual
   */
  async getTenantInfo(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error getting tenant info:', error)
      return null
    }
  }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance()
