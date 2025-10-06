import { getSupabaseWithTenant } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type MessageUpdate = Database['public']['Tables']['messages']['Update']

export interface MessageWithDetails extends Message {
  sender?: {
    id: string
    full_name: string | null
    email: string
    role: string | null
    avatar_url: string | null
  }
  lead?: {
    id: string
    customer_name: string | null
    vehicle_info: string | null
    status: string
  }
}

export interface MessageFilters {
  lead_id?: string
  sender_id?: string
  message_type?: 'text' | 'image' | 'document' | 'voice' | 'system'
  is_read?: boolean
  date_from?: string
  date_to?: string
}

export interface ConversationSummary {
  lead_id: string
  total_messages: number
  unread_messages: number
  last_message: string | null
  last_message_at: string | null
  last_sender: string | null
  participants: string[]
}

export const messageService = {
  async getMessages(filters: MessageFilters = {}): Promise<MessageWithDetails[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, full_name, email, role, avatar_url),
          lead:leads!lead_id(id, customer_name, vehicle_info, status)
        `)
        .order('created_at', { ascending: false })

      if (filters.lead_id) {
        query = query.eq('lead_id', filters.lead_id)
      }
      if (filters.sender_id) {
        query = query.eq('sender_id', filters.sender_id)
      }
      if (filters.message_type) {
        query = query.eq('message_type', filters.message_type)
      }
      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching messages:', error)
        throw new Error(`Error fetching messages: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Message service error:', error)
      throw error
    }
  },

  async getMessageById(id: string): Promise<MessageWithDetails | null> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, full_name, email, role, avatar_url),
          lead:leads!lead_id(id, customer_name, vehicle_info, status)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No encontrado
        console.error('Error fetching message:', error)
        throw new Error(`Error fetching message: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Message service error:', error)
      throw error
    }
  },

  async getConversation(leadId: string, limit?: number): Promise<MessageWithDetails[]> {
    try {
      let query = this.getMessages({ lead_id: leadId })
      
      if (limit) {
        const { supabase } = getSupabaseWithTenant()
        query = supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id(id, full_name, email, role, avatar_url),
            lead:leads!lead_id(id, customer_name, vehicle_info, status)
          `)
          .eq('lead_id', leadId)
          .order('created_at', { ascending: true })
          .limit(limit) as any
      }

      const messages = await query
      
      // Ordenar por fecha ascendente para mostrar conversación cronológicamente
      return Array.isArray(messages) ? 
        messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) :
        []
    } catch (error) {
      console.error('Conversation error:', error)
      return []
    }
  },

  async sendMessage(messageData: MessageInsert): Promise<Message> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        throw new Error(`Error sending message: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Send message error:', error)
      throw error
    }
  },

  async markAsRead(messageId: string): Promise<void> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)

      if (error) {
        console.error('Error marking message as read:', error)
        throw new Error(`Error marking message as read: ${error.message}`)
      }
    } catch (error) {
      console.error('Mark as read error:', error)
      throw error
    }
  },

  async markConversationAsRead(leadId: string, userId: string): Promise<void> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('lead_id', leadId)
        .neq('sender_id', userId) // No marcar como leídos los propios mensajes
        .eq('is_read', false)

      if (error) {
        console.error('Error marking conversation as read:', error)
        throw new Error(`Error marking conversation as read: ${error.message}`)
      }
    } catch (error) {
      console.error('Mark conversation as read error:', error)
      throw error
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        console.error('Error deleting message:', error)
        throw new Error(`Error deleting message: ${error.message}`)
      }
    } catch (error) {
      console.error('Delete message error:', error)
      throw error
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', userId) // No contar propios mensajes
        .eq('is_read', false)

      if (error) {
        console.error('Error counting unread messages:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Unread count error:', error)
      return 0
    }
  },

  async getConversationSummaries(userId: string): Promise<ConversationSummary[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      // Obtener todos los leads donde el usuario participa
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          id,
          customer_name,
          vehicle_info,
          status,
          assigned_to
        `)
        .or(`assigned_to.eq.${userId},customer_id.eq.${userId}`)

      if (leadsError) {
        console.error('Error fetching leads:', leadsError)
        return []
      }

      // Para cada lead, obtener resumen de mensajes
      const summaries = await Promise.all(
        (leads || []).map(async (lead: any) => {
          const [totalCount, unreadCount, lastMessage] = await Promise.all([
            this.getMessageCount(lead.id),
            this.getUnreadMessageCount(lead.id, userId),
            this.getLastMessage(lead.id)
          ])

          return {
            lead_id: lead.id,
            total_messages: totalCount,
            unread_messages: unreadCount,
            last_message: lastMessage?.message || null,
            last_message_at: lastMessage?.created_at || null,
            last_sender: lastMessage?.sender_id || null,
            participants: [lead.assigned_to, lead.customer_id].filter(Boolean)
          }
        })
      )

      return summaries.sort((a: any, b: any) => {
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
        return dateB - dateA
      })
    } catch (error) {
      console.error('Conversation summaries error:', error)
      return []
    }
  },

  async getMessageCount(leadId: string): Promise<number> {
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
      console.error('Message count error:', error)
      return 0
    }
  },

  async getUnreadMessageCount(leadId: string, userId: string): Promise<number> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('lead_id', leadId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('Error counting unread messages:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Unread message count error:', error)
      return 0
    }
  },

  async getLastMessage(leadId: string): Promise<Message | null> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No encontrado
        console.error('Error fetching last message:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Last message error:', error)
      return null
    }
  },

  async searchMessages(query: string, filters: MessageFilters = {}): Promise<MessageWithDetails[]> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      let dbQuery = supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, full_name, email, role, avatar_url),
          lead:leads!lead_id(id, customer_name, vehicle_info, status)
        `)
        .textSearch('message', query)
        .order('created_at', { ascending: false })

      if (filters.lead_id) {
        dbQuery = dbQuery.eq('lead_id', filters.lead_id)
      }
      if (filters.sender_id) {
        dbQuery = dbQuery.eq('sender_id', filters.sender_id)
      }
      if (filters.message_type) {
        dbQuery = dbQuery.eq('message_type', filters.message_type)
      }

      const { data, error } = await dbQuery

      if (error) {
        console.error('Error searching messages:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Search messages error:', error)
      return []
    }
  },

  async getMessageStats(filters: MessageFilters = {}): Promise<{
    total_messages: number
    unread_messages: number
    messages_today: number
    messages_this_week: number
    avg_response_time_hours: number
  }> {
    try {
      const { supabase } = getSupabaseWithTenant()
      
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

      let baseQuery = supabase.from('messages').select('*', { count: 'exact', head: true })

      if (filters.lead_id) {
        baseQuery = baseQuery.eq('lead_id', filters.lead_id)
      }
      if (filters.sender_id) {
        baseQuery = baseQuery.eq('sender_id', filters.sender_id)
      }

      const [
        totalResult,
        unreadResult,
        todayResult,
        weekResult
      ] = await Promise.all([
        baseQuery,
        baseQuery.eq('is_read', false),
        baseQuery.gte('created_at', todayStart),
        baseQuery.gte('created_at', weekStart)
      ])

      return {
        total_messages: totalResult.count || 0,
        unread_messages: unreadResult.count || 0,
        messages_today: todayResult.count || 0,
        messages_this_week: weekResult.count || 0,
        avg_response_time_hours: 0 // TODO: Calcular tiempo promedio de respuesta
      }
    } catch (error) {
      console.error('Message stats error:', error)
      return {
        total_messages: 0,
        unread_messages: 0,
        messages_today: 0,
        messages_this_week: 0,
        avg_response_time_hours: 0
      }
    }
  }
}