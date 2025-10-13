import { getSupabaseWithTenant } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']

export interface LeadWithDetails extends Lead {
  customer?: {
    id: string
    full_name: string | null
    email: string
    phone: string | null
  }
  vehicle?: {
    id: string
    brand: string
    model: string
    year: number
    price: number
    images?: string[]
  }
  branch?: {
    id: string
    name: string
    city: string
  }
  assigned_user?: {
    id: string
    full_name: string | null
    email: string
    role: string | null
  }
  messages_count?: number
  last_activity?: string
}

export interface LeadFilters {
  status?: 'new' | 'contacted' | 'interested' | 'negotiating' | 'sold' | 'lost'
  source?: 'web' | 'phone' | 'email' | 'whatsapp' | 'social_media' | 'referral' | 'walk_in'
  branch_id?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface LeadStats {
  total_leads: number
  new_leads: number
  contacted_leads: number
  interested_leads: number
  negotiating_leads: number
  sold_leads: number
  lost_leads: number
  conversion_rate: number
}

export const leadService = {
  async getLeads(filters: LeadFilters = {}): Promise<LeadWithDetails[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      let query = supabase
        .from('leads')
        .select(`
          *,
          customer:users!customer_id(id, full_name, email, phone),
          vehicle:vehicles!vehicle_id(id, brand, model, year, price, images),
          branch:branches!branch_id(id, name, city),
          assigned_user:users!assigned_to(id, full_name, email, role)
        `)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.source) {
        query = query.eq('source', filters.source)
      }
      if (filters.branch_id) {
        query = query.eq('branch_id', filters.branch_id)
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching leads:', error)
        throw new Error(`Error fetching leads: ${error.message}`)
      }

      // Obtener conteo de mensajes y última actividad para cada lead
      const leadsWithStats = await Promise.all(
        (data || []).map(async (lead: any) => {
          const [messagesCount, lastActivity] = await Promise.all([
            this.getMessagesCount(lead.id),
            this.getLastActivity(lead.id)
          ])

          return {
            ...lead,
            messages_count: messagesCount,
            last_activity: lastActivity
          }
        })
      )

      return leadsWithStats
    } catch (error) {
      console.error('Lead service error:', error)
      throw error
    }
  },

  async getLeadById(id: string): Promise<LeadWithDetails | null> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          customer:users!customer_id(id, full_name, email, phone),
          vehicle:vehicles!vehicle_id(id, brand, model, year, price, images),
          branch:branches!branch_id(id, name, city),
          assigned_user:users!assigned_to(id, full_name, email, role)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No encontrado
        console.error('Error fetching lead:', error)
        throw new Error(`Error fetching lead: ${error.message}`)
      }

      const [messagesCount, lastActivity] = await Promise.all([
        this.getMessagesCount(id),
        this.getLastActivity(id)
      ])

      return {
        ...(data as any),
        messages_count: messagesCount,
        last_activity: lastActivity
      }
    } catch (error) {
      console.error('Lead service error:', error)
      throw error
    }
  },

  async createLead(leadData: LeadInsert): Promise<Lead> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await (supabase as any)
        .from('leads')
        .insert([leadData])
        .select()
        .single()

      if (error) {
        console.error('Error creating lead:', error)
        throw new Error(`Error creating lead: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Lead service error:', error)
      throw error
    }
  },

  async updateLead(id: string, updates: LeadUpdate): Promise<Lead> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await (supabase as any)
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating lead:', error)
        throw new Error(`Error updating lead: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Lead service error:', error)
      throw error
    }
  },

  async deleteLead(id: string): Promise<void> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting lead:', error)
        throw new Error(`Error deleting lead: ${error.message}`)
      }
    } catch (error) {
      console.error('Lead service error:', error)
      throw error
    }
  },

  async assignLead(leadId: string, userId: string): Promise<void> {
    try {
      await this.updateLead(leadId, {
        assigned_to: userId,
        status: 'contacted' as const
      })
    } catch (error) {
      console.error('Error assigning lead:', error)
      throw error
    }
  },

  async changeStatus(leadId: string, status: Lead['status'], notes?: string): Promise<void> {
    try {
      const updates: LeadUpdate = { status }
      if (notes) {
        updates.notes = notes
      }
      
      await this.updateLead(leadId, updates)

      // Si el lead se marca como contactado, registrar actividad
      if (status === 'contacted') {
        await this.recordActivity(leadId, 'contact_attempted')
      }
    } catch (error) {
      console.error('Error changing lead status:', error)
      throw error
    }
  },

  async getMessagesCount(leadId: string): Promise<number> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('lead_id', leadId)

      if (error) {
        console.error('Error counting messages:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Messages count error:', error)
      return 0
    }
  },

  async getLastActivity(leadId: string): Promise<string | null> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('messages')
        .select('created_at')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No encontrado
        console.error('Error fetching last activity:', error)
        return null
      }

      return (data as any)?.created_at || null
    } catch (error) {
      console.error('Last activity error:', error)
      return null
    }
  },

  async recordActivity(leadId: string, _activity: string): Promise<void> {
    try {
      // Por ahora solo actualizar el timestamp, después podemos crear tabla de actividades
      await this.updateLead(leadId, { updated_at: new Date().toISOString() })
    } catch (error) {
      console.error('Error recording activity:', error)
      // No lanzar error para no interrumpir el flujo principal
    }
  },

  async getLeadStats(filters: LeadFilters = {}): Promise<LeadStats> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      let baseQuery = supabase.from('leads').select('status', { count: 'exact', head: true })

      if (filters.branch_id) {
        baseQuery = baseQuery.eq('branch_id', filters.branch_id)
      }
      if (filters.assigned_to) {
        baseQuery = baseQuery.eq('assigned_to', filters.assigned_to)
      }
      if (filters.date_from) {
        baseQuery = baseQuery.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        baseQuery = baseQuery.lte('created_at', filters.date_to)
      }

      const [
        totalResult,
        newResult,
        contactedResult,
        interestedResult,
        negotiatingResult,
        soldResult,
        lostResult
      ] = await Promise.all([
        baseQuery,
        baseQuery.eq('status', 'new'),
        baseQuery.eq('status', 'contacted'),
        baseQuery.eq('status', 'interested'),
        baseQuery.eq('status', 'negotiating'),
        baseQuery.eq('status', 'sold'),
        baseQuery.eq('status', 'lost')
      ])

      const totalLeads = totalResult.count || 0
      const soldLeads = soldResult.count || 0
      const conversionRate = totalLeads > 0 ? (soldLeads / totalLeads) * 100 : 0

      return {
        total_leads: totalLeads,
        new_leads: newResult.count || 0,
        contacted_leads: contactedResult.count || 0,
        interested_leads: interestedResult.count || 0,
        negotiating_leads: negotiatingResult.count || 0,
        sold_leads: soldLeads,
        lost_leads: lostResult.count || 0,
        conversion_rate: Math.round(conversionRate * 100) / 100
      }
    } catch (error) {
      console.error('Lead stats error:', error)
      return {
        total_leads: 0,
        new_leads: 0,
        contacted_leads: 0,
        interested_leads: 0,
        negotiating_leads: 0,
        sold_leads: 0,
        lost_leads: 0,
        conversion_rate: 0
      }
    }
  },

  async getLeadsByBranch(branchId: string): Promise<LeadWithDetails[]> {
    return this.getLeads({ branch_id: branchId })
  },

  async getLeadsByUser(userId: string): Promise<LeadWithDetails[]> {
    return this.getLeads({ assigned_to: userId })
  },

  async getPriorityLeads(): Promise<LeadWithDetails[]> {
    return this.getLeads({ priority: 'high' })
  },

  async getRecentLeads(limit: number = 10): Promise<LeadWithDetails[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          customer:users!customer_id(id, full_name, email, phone),
          vehicle:vehicles!vehicle_id(id, brand, model, year, price),
          branch:branches!branch_id(id, name, city)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent leads:', error)
        throw new Error(`Error fetching recent leads: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Recent leads error:', error)
      return []
    }
  }
}