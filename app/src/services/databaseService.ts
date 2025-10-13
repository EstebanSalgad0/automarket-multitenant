import { supabase } from '../lib/supabase'

/**
 * Servicio simplificado para gestión de la base de datos optimizada
 * Compatible con los tipos actuales de Supabase
 */

/**
 * Servicio básico para interacciones con la base de datos
 */
export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  /**
   * Ejecutar consultas SQL directas (para migraciones y funciones especiales)
   */
  async executeSQL(_sql: string, _params?: any[]): Promise<{ data: any; error: any }> {
    try {
      // Por ahora comentamos el RPC hasta que se configure en Supabase
      console.warn('executeSQL temporalmente deshabilitado - requiere función RPC en Supabase')
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Verificar si las nuevas tablas existen
   */
  async checkOptimizedTables(): Promise<{
    hasOptimizedSchema: boolean
    missingTables: string[]
    existingTables: string[]
  }> {
    try {
      const requiredTables = [
        'tenants', 
        'branches', 
        'user_profiles', 
        'vehicles', 
        'leads', 
        'sales',
        'vehicle_images',
        'lead_activities'
      ]

      const missingTables: string[] = []
      const existingTables: string[] = []

      for (const table of requiredTables) {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1)

        if (error) {
          if (error.code === '42P01') { // table does not exist
            missingTables.push(table)
          }
        } else {
          existingTables.push(table)
        }
      }

      return {
        hasOptimizedSchema: missingTables.length === 0,
        missingTables,
        existingTables
      }
    } catch (error) {
      console.error('Error checking optimized tables:', error)
      return {
        hasOptimizedSchema: false,
        missingTables: [],
        existingTables: []
      }
    }
  }

  /**
   * Obtener información básica de un tenant
   */
  async getTenantInfo(tenantId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Obtener todas las sucursales de un tenant
   */
  async getBranches(tenantId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name')

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Obtener usuarios/empleados básicos
   */
  async getUsers(tenantId: string, userType?: string): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .eq('tenant_id', tenantId)

      if (userType) {
        query = query.eq('user_type', userType)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Obtener vehículos básicos
   */
  async getVehicles(tenantId: string, filters?: {
    status?: string
    branchId?: string
    limit?: number
  }): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('tenant_id', tenantId)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Obtener leads básicos
   */
  async getLeads(tenantId: string, filters?: {
    status?: string
    assignedTo?: string
    limit?: number
  }): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Obtener ventas básicas
   */
  async getSales(tenantId: string, filters?: {
    status?: string
    salespersonId?: string
    limit?: number
  }): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .eq('tenant_id', tenantId)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Crear registro genérico
   */
  async createRecord(table: string, data: Record<string, any>): Promise<{ data: any | null; error: any }> {
    try {
      const { data: result, error } = await (supabase as any)
        .from(table)
        .insert([data])
        .select()
        .single()

      return { data: result, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Actualizar registro genérico
   */
  async updateRecord(
    table: string, 
    id: string, 
    updates: Record<string, any>
  ): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await (supabase as any)
        .from(table)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Eliminar registro genérico
   */
  async deleteRecord(table: string, id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  /**
   * Obtener estadísticas generales del sistema
   */
  async getSystemStats(tenantId: string): Promise<{
    totalUsers: number
    totalVehicles: number
    totalLeads: number
    totalSales: number
    availableVehicles: number
    activeLeads: number
    completedSales: number
  }> {
    try {
      const [users, vehicles, leads, sales] = await Promise.all([
        this.getUsers(tenantId),
        this.getVehicles(tenantId),
        this.getLeads(tenantId),
        this.getSales(tenantId)
      ])

      const stats = {
        totalUsers: users.data?.length || 0,
        totalVehicles: vehicles.data?.length || 0,
        totalLeads: leads.data?.length || 0,
        totalSales: sales.data?.length || 0,
        availableVehicles: vehicles.data?.filter(v => v.status === 'available').length || 0,
        activeLeads: leads.data?.filter(l => !['closed_won', 'closed_lost'].includes(l.status)).length || 0,
        completedSales: sales.data?.filter(s => s.status === 'completed').length || 0
      }

      return stats
    } catch (error) {
      console.error('Error getting system stats:', error)
      return {
        totalUsers: 0,
        totalVehicles: 0,
        totalLeads: 0,
        totalSales: 0,
        availableVehicles: 0,
        activeLeads: 0,
        completedSales: 0
      }
    }
  }
}

// Exportar instancia singleton
export const databaseService = DatabaseService.getInstance()