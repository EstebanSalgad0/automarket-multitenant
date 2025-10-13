import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Servicio para manejar suscripciones de tiempo real en AutoMarket
 */
export class RealtimeService {
  private static instance: RealtimeService
  private subscriptions: Map<string, RealtimeChannel> = new Map()

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService()
    }
    return RealtimeService.instance
  }

  /**
   * Suscribirse a cambios en vehículos
   */
  subscribeToVehicles(
    tenantId: string,
    onInsert?: (payload: any) => void,
    onUpdate?: (payload: any) => void,
    onDelete?: (payload: any) => void
  ): string {
    const channelName = `vehicles-${tenantId}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vehicles',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('🚗 Nuevo vehículo:', payload.new)
          onInsert?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('🔄 Vehículo actualizado:', payload.new)
          onUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'vehicles',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('🗑️ Vehículo eliminado:', payload.old)
          onDelete?.(payload)
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  /**
   * Suscribirse a cambios en leads
   */
  subscribeToLeads(
    tenantId: string,
    userId?: string,
    onInsert?: (payload: any) => void,
    onUpdate?: (payload: any) => void,
    onDelete?: (payload: any) => void
  ): string {
    const channelName = `leads-${tenantId}${userId ? `-${userId}` : ''}`
    
    let filter = `tenant_id=eq.${tenantId}`
    if (userId) {
      filter += `&assigned_to=eq.${userId}`
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter
        },
        (payload) => {
          console.log('📝 Nuevo lead:', payload.new)
          onInsert?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter
        },
        (payload) => {
          console.log('🔄 Lead actualizado:', payload.new)
          onUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'leads',
          filter
        },
        (payload) => {
          console.log('🗑️ Lead eliminado:', payload.old)
          onDelete?.(payload)
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  /**
   * Suscribirse a cambios en ventas
   */
  subscribeToSales(
    tenantId: string,
    salespersonId?: string,
    onInsert?: (payload: any) => void,
    onUpdate?: (payload: any) => void,
    onDelete?: (payload: any) => void
  ): string {
    const channelName = `sales-${tenantId}${salespersonId ? `-${salespersonId}` : ''}`
    
    let filter = `tenant_id=eq.${tenantId}`
    if (salespersonId) {
      filter += `&salesperson_id=eq.${salespersonId}`
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sales',
          filter
        },
        (payload) => {
          console.log('💰 Nueva venta:', payload.new)
          onInsert?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sales',
          filter
        },
        (payload) => {
          console.log('🔄 Venta actualizada:', payload.new)
          onUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'sales',
          filter
        },
        (payload) => {
          console.log('🗑️ Venta eliminada:', payload.old)
          onDelete?.(payload)
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  /**
   * Suscribirse a cambios en perfiles de usuario
   */
  subscribeToUserProfiles(
    tenantId: string,
    onInsert?: (payload: any) => void,
    onUpdate?: (payload: any) => void,
    onDelete?: (payload: any) => void
  ): string {
    const channelName = `user-profiles-${tenantId}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_profiles',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('👤 Nuevo usuario:', payload.new)
          onInsert?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('🔄 Usuario actualizado:', payload.new)
          onUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_profiles',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('🗑️ Usuario eliminado:', payload.old)
          onDelete?.(payload)
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)
    return channelName
  }

  /**
   * Suscribirse a múltiples tablas con un solo canal
   */
  subscribeToAll(
    tenantId: string,
    callbacks: {
      vehicles?: {
        onInsert?: (payload: any) => void
        onUpdate?: (payload: any) => void
        onDelete?: (payload: any) => void
      }
      leads?: {
        onInsert?: (payload: any) => void
        onUpdate?: (payload: any) => void
        onDelete?: (payload: any) => void
      }
      sales?: {
        onInsert?: (payload: any) => void
        onUpdate?: (payload: any) => void
        onDelete?: (payload: any) => void
      }
      userProfiles?: {
        onInsert?: (payload: any) => void
        onUpdate?: (payload: any) => void
        onDelete?: (payload: any) => void
      }
    }
  ): string {
    const channelName = `all-changes-${tenantId}`
    
    let channel = supabase.channel(channelName)

    // Vehicles
    if (callbacks.vehicles) {
      if (callbacks.vehicles.onInsert) {
        channel = channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'vehicles', filter: `tenant_id=eq.${tenantId}` },
          callbacks.vehicles.onInsert
        )
      }
      if (callbacks.vehicles.onUpdate) {
        channel = channel.on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'vehicles', filter: `tenant_id=eq.${tenantId}` },
          callbacks.vehicles.onUpdate
        )
      }
      if (callbacks.vehicles.onDelete) {
        channel = channel.on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'vehicles', filter: `tenant_id=eq.${tenantId}` },
          callbacks.vehicles.onDelete
        )
      }
    }

    // Leads
    if (callbacks.leads) {
      if (callbacks.leads.onInsert) {
        channel = channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'leads', filter: `tenant_id=eq.${tenantId}` },
          callbacks.leads.onInsert
        )
      }
      if (callbacks.leads.onUpdate) {
        channel = channel.on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'leads', filter: `tenant_id=eq.${tenantId}` },
          callbacks.leads.onUpdate
        )
      }
      if (callbacks.leads.onDelete) {
        channel = channel.on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'leads', filter: `tenant_id=eq.${tenantId}` },
          callbacks.leads.onDelete
        )
      }
    }

    // Sales
    if (callbacks.sales) {
      if (callbacks.sales.onInsert) {
        channel = channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sales', filter: `tenant_id=eq.${tenantId}` },
          callbacks.sales.onInsert
        )
      }
      if (callbacks.sales.onUpdate) {
        channel = channel.on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'sales', filter: `tenant_id=eq.${tenantId}` },
          callbacks.sales.onUpdate
        )
      }
      if (callbacks.sales.onDelete) {
        channel = channel.on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'sales', filter: `tenant_id=eq.${tenantId}` },
          callbacks.sales.onDelete
        )
      }
    }

    // User Profiles
    if (callbacks.userProfiles) {
      if (callbacks.userProfiles.onInsert) {
        channel = channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_profiles', filter: `tenant_id=eq.${tenantId}` },
          callbacks.userProfiles.onInsert
        )
      }
      if (callbacks.userProfiles.onUpdate) {
        channel = channel.on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'user_profiles', filter: `tenant_id=eq.${tenantId}` },
          callbacks.userProfiles.onUpdate
        )
      }
      if (callbacks.userProfiles.onDelete) {
        channel = channel.on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'user_profiles', filter: `tenant_id=eq.${tenantId}` },
          callbacks.userProfiles.onDelete
        )
      }
    }

    channel.subscribe()
    this.subscriptions.set(channelName, channel)
    return channelName
  }

  /**
   * Cancelar suscripción específica
   */
  unsubscribe(subscriptionId: string): void {
    const channel = this.subscriptions.get(subscriptionId)
    if (channel) {
      channel.unsubscribe()
      this.subscriptions.delete(subscriptionId)
      console.log(`🔌 Suscripción cancelada: ${subscriptionId}`)
    }
  }

  /**
   * Cancelar todas las suscripciones
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((channel, id) => {
      channel.unsubscribe()
      console.log(`🔌 Suscripción cancelada: ${id}`)
    })
    this.subscriptions.clear()
  }

  /**
   * Obtener estado de suscripciones activas
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys())
  }

  /**
   * Verificar si una suscripción está activa
   */
  isSubscribed(subscriptionId: string): boolean {
    return this.subscriptions.has(subscriptionId)
  }
}

// Exportar instancia singleton
export const realtimeService = RealtimeService.getInstance()