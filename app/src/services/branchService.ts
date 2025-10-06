import { getSupabaseWithTenant } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Branch = Database['public']['Tables']['branches']['Row']
type BranchInsert = Database['public']['Tables']['branches']['Insert']
type BranchUpdate = Database['public']['Tables']['branches']['Update']

export interface BranchWithManager extends Branch {
  manager?: {
    id: string
    full_name: string | null
    email: string
    role: string | null
  }
  vehicle_count?: number
  active_leads_count?: number
}

export interface BranchFilters {
  status?: 'active' | 'inactive' | 'maintenance'
  manager_id?: string
  city?: string
  region?: string
}

export interface BranchStats {
  total_branches: number
  active_branches: number
  total_vehicles: number
  active_leads: number
  total_sales_this_month: number
}

export const branchService = {
  async getBranches(filters: BranchFilters = {}): Promise<BranchWithManager[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      let query = supabase
        .from('branches')
        .select(`
          *,
          manager:users!manager_id(id, full_name, email, role)
        `)
        .order('name')

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.city) {
        query = query.eq('city', filters.city)
      }
      if (filters.region) {
        query = query.eq('region', filters.region)
      }
      if (filters.manager_id) {
        query = query.eq('manager_id', filters.manager_id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching branches:', error)
        throw new Error(`Error fetching branches: ${error.message}`)
      }

      // Obtener estadísticas para cada branch
      const branchesWithStats = await Promise.all(
        (data || []).map(async (branch: any) => {
          const [vehicleCount, leadsCount] = await Promise.all([
            this.getVehicleCount(branch.id),
            this.getActiveLeadsCount(branch.id)
          ])

          return {
            ...branch,
            vehicle_count: vehicleCount,
            active_leads_count: leadsCount
          }
        })
      )

      return branchesWithStats
    } catch (error) {
      console.error('Branch service error:', error)
      throw error
    }
  },

  async getBranchById(id: string): Promise<BranchWithManager | null> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('branches')
        .select(`
          *,
          manager:users!manager_id(id, full_name, email, role)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No encontrado
        console.error('Error fetching branch:', error)
        throw new Error(`Error fetching branch: ${error.message}`)
      }

      const [vehicleCount, leadsCount] = await Promise.all([
        this.getVehicleCount(id),
        this.getActiveLeadsCount(id)
      ])

      if (!data) return null

      return {
        ...(data as any),
        vehicle_count: vehicleCount,
        active_leads_count: leadsCount
      } as BranchWithManager
    } catch (error) {
      console.error('Branch service error:', error)
      throw error
    }
  },

  async createBranch(branchData: BranchInsert): Promise<Branch> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await (supabase as any)
        .from('branches')
        .insert(branchData)
        .select()
        .single()

      if (error) {
        console.error('Error creating branch:', error)
        throw new Error(`Error creating branch: ${error.message}`)
      }

      return data as Branch
    } catch (error) {
      console.error('Branch service error:', error)
      throw error
    }
  },

  async updateBranch(id: string, updates: BranchUpdate): Promise<Branch> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await (supabase as any)
        .from('branches')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating branch:', error)
        throw new Error(`Error updating branch: ${error.message}`)
      }

      return data as Branch
    } catch (error) {
      console.error('Branch service error:', error)
      throw error
    }
  },

  async deleteBranch(id: string): Promise<void> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      // Verificar si hay vehículos o leads asociados
      const [vehicleCount, leadsCount] = await Promise.all([
        this.getVehicleCount(id),
        this.getActiveLeadsCount(id)
      ])

      if (vehicleCount > 0 || leadsCount > 0) {
        throw new Error('No se puede eliminar una sucursal con vehículos o leads activos')
      }

      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting branch:', error)
        throw new Error(`Error deleting branch: ${error.message}`)
      }
    } catch (error) {
      console.error('Branch service error:', error)
      throw error
    }
  },

  async getVehicleCount(branchId: string): Promise<number> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { count, error } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId)
        .eq('status', 'active')

      if (error) {
        console.error('Error counting vehicles:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Vehicle count error:', error)
      return 0
    }
  },

  async getActiveLeadsCount(branchId: string): Promise<number> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId)
        .in('status', ['new', 'contacted', 'qualified'])

      if (error) {
        console.error('Error counting leads:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Leads count error:', error)
      return 0
    }
  },

  async getBranchStats(branchId?: string): Promise<BranchStats> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      let branchFilter = branchId ? { branch_id: branchId } : {}

      const [
        branchesResult,
        vehiclesResult,
        leadsResult
      ] = await Promise.all([
        branchId ? 
          Promise.resolve({ count: 1 }) : 
          supabase.from('branches').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'active').match(branchFilter),
        supabase.from('leads').select('*', { count: 'exact', head: true }).in('status', ['new', 'contacted', 'qualified']).match(branchFilter)
      ])

      return {
        total_branches: branchesResult.count || 0,
        active_branches: branchesResult.count || 0,
        total_vehicles: vehiclesResult.count || 0,
        active_leads: leadsResult.count || 0,
        total_sales_this_month: 0 // TODO: Implementar cuando tengamos tabla de ventas
      }
    } catch (error) {
      console.error('Branch stats error:', error)
      return {
        total_branches: 0,
        active_branches: 0,
        total_vehicles: 0,
        active_leads: 0,
        total_sales_this_month: 0
      }
    }
  },

  async assignManager(branchId: string, managerId: string): Promise<void> {
    try {
      await this.updateBranch(branchId, { manager_id: managerId })
      
      // Actualizar el rol del usuario a branch_manager
      const { supabase } = getSupabaseWithTenant()
      await (supabase as any)
        .from('users')
        .update({ 
          role: 'branch_manager',
          branch_id: branchId 
        })
        .eq('id', managerId)
    } catch (error) {
      console.error('Error assigning manager:', error)
      throw error
    }
  },

  async getAvailableManagers(): Promise<any[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, branch_id')
        .in('role', ['branch_manager', 'sales_person'])
        .order('full_name')

      if (error) {
        console.error('Error fetching managers:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Available managers error:', error)
      return []
    }
  }
}