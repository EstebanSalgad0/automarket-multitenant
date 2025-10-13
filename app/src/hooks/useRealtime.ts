import { useEffect, useState, useCallback } from 'react'
import { realtimeService } from '../services/realtimeService'

/**
 * Hook para suscribirse a cambios en tiempo real de vehículos
 */
export const useRealtimeVehicles = (tenantId: string) => {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [lastChange, setLastChange] = useState<{
    type: 'INSERT' | 'UPDATE' | 'DELETE'
    data: any
    timestamp: Date
  } | null>(null)

  const addVehicle = useCallback((payload: any) => {
    setVehicles(prev => [...prev, payload.new])
    setLastChange({ type: 'INSERT', data: payload.new, timestamp: new Date() })
  }, [])

  const updateVehicle = useCallback((payload: any) => {
    setVehicles(prev => prev.map(v => v.id === payload.new.id ? payload.new : v))
    setLastChange({ type: 'UPDATE', data: payload.new, timestamp: new Date() })
  }, [])

  const removeVehicle = useCallback((payload: any) => {
    setVehicles(prev => prev.filter(v => v.id !== payload.old.id))
    setLastChange({ type: 'DELETE', data: payload.old, timestamp: new Date() })
  }, [])

  useEffect(() => {
    if (!tenantId) return

    const subscriptionId = realtimeService.subscribeToVehicles(
      tenantId,
      addVehicle,
      updateVehicle,
      removeVehicle
    )

    return () => {
      realtimeService.unsubscribe(subscriptionId)
    }
  }, [tenantId, addVehicle, updateVehicle, removeVehicle])

  return { vehicles, lastChange, setVehicles }
}

/**
 * Hook para suscribirse a cambios en tiempo real de leads
 */
export const useRealtimeLeads = (tenantId: string, userId?: string) => {
  const [leads, setLeads] = useState<any[]>([])
  const [lastChange, setLastChange] = useState<{
    type: 'INSERT' | 'UPDATE' | 'DELETE'
    data: any
    timestamp: Date
  } | null>(null)

  const addLead = useCallback((payload: any) => {
    setLeads(prev => [...prev, payload.new])
    setLastChange({ type: 'INSERT', data: payload.new, timestamp: new Date() })
  }, [])

  const updateLead = useCallback((payload: any) => {
    setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new : l))
    setLastChange({ type: 'UPDATE', data: payload.new, timestamp: new Date() })
  }, [])

  const removeLead = useCallback((payload: any) => {
    setLeads(prev => prev.filter(l => l.id !== payload.old.id))
    setLastChange({ type: 'DELETE', data: payload.old, timestamp: new Date() })
  }, [])

  useEffect(() => {
    if (!tenantId) return

    const subscriptionId = realtimeService.subscribeToLeads(
      tenantId,
      userId,
      addLead,
      updateLead,
      removeLead
    )

    return () => {
      realtimeService.unsubscribe(subscriptionId)
    }
  }, [tenantId, userId, addLead, updateLead, removeLead])

  return { leads, lastChange, setLeads }
}

/**
 * Hook para suscribirse a cambios en tiempo real de ventas
 */
export const useRealtimeSales = (tenantId: string, salespersonId?: string) => {
  const [sales, setSales] = useState<any[]>([])
  const [lastChange, setLastChange] = useState<{
    type: 'INSERT' | 'UPDATE' | 'DELETE'
    data: any
    timestamp: Date
  } | null>(null)

  const addSale = useCallback((payload: any) => {
    setSales(prev => [...prev, payload.new])
    setLastChange({ type: 'INSERT', data: payload.new, timestamp: new Date() })
  }, [])

  const updateSale = useCallback((payload: any) => {
    setSales(prev => prev.map(s => s.id === payload.new.id ? payload.new : s))
    setLastChange({ type: 'UPDATE', data: payload.new, timestamp: new Date() })
  }, [])

  const removeSale = useCallback((payload: any) => {
    setSales(prev => prev.filter(s => s.id !== payload.old.id))
    setLastChange({ type: 'DELETE', data: payload.old, timestamp: new Date() })
  }, [])

  useEffect(() => {
    if (!tenantId) return

    const subscriptionId = realtimeService.subscribeToSales(
      tenantId,
      salespersonId,
      addSale,
      updateSale,
      removeSale
    )

    return () => {
      realtimeService.unsubscribe(subscriptionId)
    }
  }, [tenantId, salespersonId, addSale, updateSale, removeSale])

  return { sales, lastChange, setSales }
}

/**
 * Hook para suscribirse a cambios en tiempo real de usuarios
 */
export const useRealtimeUsers = (tenantId: string) => {
  const [users, setUsers] = useState<any[]>([])
  const [lastChange, setLastChange] = useState<{
    type: 'INSERT' | 'UPDATE' | 'DELETE'
    data: any
    timestamp: Date
  } | null>(null)

  const addUser = useCallback((payload: any) => {
    setUsers(prev => [...prev, payload.new])
    setLastChange({ type: 'INSERT', data: payload.new, timestamp: new Date() })
  }, [])

  const updateUser = useCallback((payload: any) => {
    setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u))
    setLastChange({ type: 'UPDATE', data: payload.new, timestamp: new Date() })
  }, [])

  const removeUser = useCallback((payload: any) => {
    setUsers(prev => prev.filter(u => u.id !== payload.old.id))
    setLastChange({ type: 'DELETE', data: payload.old, timestamp: new Date() })
  }, [])

  useEffect(() => {
    if (!tenantId) return

    const subscriptionId = realtimeService.subscribeToUserProfiles(
      tenantId,
      addUser,
      updateUser,
      removeUser
    )

    return () => {
      realtimeService.unsubscribe(subscriptionId)
    }
  }, [tenantId, addUser, updateUser, removeUser])

  return { users, lastChange, setUsers }
}

/**
 * Hook para suscribirse a múltiples tablas al mismo tiempo
 */
export const useRealtimeAll = (tenantId: string) => {
  const [data, setData] = useState({
    vehicles: [] as any[],
    leads: [] as any[],
    sales: [] as any[],
    users: [] as any[]
  })
  
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'INSERT' | 'UPDATE' | 'DELETE'
    table: string
    data: any
    timestamp: Date
    read: boolean
  }>>([])

  const addNotification = useCallback((type: 'INSERT' | 'UPDATE' | 'DELETE', table: string, data: any) => {
    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      table,
      data,
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [notification, ...prev.slice(0, 99)]) // Máximo 100 notificaciones
  }, [])

  useEffect(() => {
    if (!tenantId) return

    const subscriptionId = realtimeService.subscribeToAll(tenantId, {
      vehicles: {
        onInsert: (payload) => {
          setData(prev => ({ ...prev, vehicles: [...prev.vehicles, payload.new] }))
          addNotification('INSERT', 'vehicles', payload.new)
        },
        onUpdate: (payload) => {
          setData(prev => ({ 
            ...prev, 
            vehicles: prev.vehicles.map(v => v.id === payload.new.id ? payload.new : v) 
          }))
          addNotification('UPDATE', 'vehicles', payload.new)
        },
        onDelete: (payload) => {
          setData(prev => ({ 
            ...prev, 
            vehicles: prev.vehicles.filter(v => v.id !== payload.old.id) 
          }))
          addNotification('DELETE', 'vehicles', payload.old)
        }
      },
      leads: {
        onInsert: (payload) => {
          setData(prev => ({ ...prev, leads: [...prev.leads, payload.new] }))
          addNotification('INSERT', 'leads', payload.new)
        },
        onUpdate: (payload) => {
          setData(prev => ({ 
            ...prev, 
            leads: prev.leads.map(l => l.id === payload.new.id ? payload.new : l) 
          }))
          addNotification('UPDATE', 'leads', payload.new)
        },
        onDelete: (payload) => {
          setData(prev => ({ 
            ...prev, 
            leads: prev.leads.filter(l => l.id !== payload.old.id) 
          }))
          addNotification('DELETE', 'leads', payload.old)
        }
      },
      sales: {
        onInsert: (payload) => {
          setData(prev => ({ ...prev, sales: [...prev.sales, payload.new] }))
          addNotification('INSERT', 'sales', payload.new)
        },
        onUpdate: (payload) => {
          setData(prev => ({ 
            ...prev, 
            sales: prev.sales.map(s => s.id === payload.new.id ? payload.new : s) 
          }))
          addNotification('UPDATE', 'sales', payload.new)
        },
        onDelete: (payload) => {
          setData(prev => ({ 
            ...prev, 
            sales: prev.sales.filter(s => s.id !== payload.old.id) 
          }))
          addNotification('DELETE', 'sales', payload.old)
        }
      },
      userProfiles: {
        onInsert: (payload) => {
          setData(prev => ({ ...prev, users: [...prev.users, payload.new] }))
          addNotification('INSERT', 'user_profiles', payload.new)
        },
        onUpdate: (payload) => {
          setData(prev => ({ 
            ...prev, 
            users: prev.users.map(u => u.id === payload.new.id ? payload.new : u) 
          }))
          addNotification('UPDATE', 'user_profiles', payload.new)
        },
        onDelete: (payload) => {
          setData(prev => ({ 
            ...prev, 
            users: prev.users.filter(u => u.id !== payload.old.id) 
          }))
          addNotification('DELETE', 'user_profiles', payload.old)
        }
      }
    })

    return () => {
      realtimeService.unsubscribe(subscriptionId)
    }
  }, [tenantId, addNotification])

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    data,
    setData,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications
  }
}