import { useState, useEffect } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardStats, VehicleStats, TeamMemberStats } from '../services/dashboardService'
import { useAuth } from './useAuth'
import { getCurrentTenant } from '../lib/supabase'

interface UseDashboardDataOptions {
  includeTeamStats?: boolean
  includeTrends?: boolean
  vehiclesLimit?: number
}

interface UseDashboardDataReturn {
  stats: DashboardStats | null
  vehicles: VehicleStats[]
  topVehicles: VehicleStats[]
  teamStats: TeamMemberStats[]
  salesTrends: { month: string; sales: number; revenue: number }[]
  loading: boolean
  error: Error | null
  refresh: () => void
}

/**
 * Hook para obtener datos del dashboard
 * Se adapta automáticamente según el rol del usuario
 */
export const useDashboardData = (options: UseDashboardDataOptions = {}): UseDashboardDataReturn => {
  const {
    includeTeamStats = false,
    includeTrends = false,
    vehiclesLimit = 10
  } = options

  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [vehicles, setVehicles] = useState<VehicleStats[]>([])
  const [topVehicles, setTopVehicles] = useState<VehicleStats[]>([])
  const [teamStats, setTeamStats] = useState<TeamMemberStats[]>([])
  const [salesTrends, setSalesTrends] = useState<{ month: string; sales: number; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const tenantSlug = getCurrentTenant()
      console.log('🔍 useDashboardData - Tenant slug:', tenantSlug)
      console.log('🔍 useDashboardData - User:', user)

      // Para Corporate Admin, NO filtrar por user.id (debe ver TODO el tenant)
      // Solo filtrar por userId para vendedores individuales
      // Por ahora, NO pasamos userId para que muestre todos los vehículos del tenant
      const userId = undefined // Cambio: NO filtrar por usuario específico

      // Obtener estadísticas generales
      const dashboardStats = await dashboardService.getDashboardStats(userId, tenantSlug)
      setStats(dashboardStats)
      console.log('📊 Dashboard stats obtenidas:', dashboardStats)

      // Obtener vehículos recientes
      const recentVehicles = await dashboardService.getVehiclesWithStats(userId, tenantSlug, vehiclesLimit)
      setVehicles(recentVehicles)
      console.log('🚗 Vehículos recientes:', recentVehicles.length)

      // Obtener vehículos más populares
      const popular = await dashboardService.getTopVehicles(tenantSlug, 5)
      setTopVehicles(popular)
      console.log('⭐ Top vehículos:', popular.length)

      // Obtener estadísticas del equipo (solo para admins)
      if (includeTeamStats) {
        const team = await dashboardService.getTeamStats(tenantSlug)
        setTeamStats(team)
        console.log('👥 Team stats:', team.length)
      }

      // Obtener tendencias de ventas
      if (includeTrends) {
        const trends = await dashboardService.getSalesTrends(tenantSlug)
        setSalesTrends(trends)
        console.log('📈 Sales trends:', trends)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err as Error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [user?.id])

  const refresh = () => {
    loadDashboardData()
  }

  return {
    stats,
    vehicles,
    topVehicles,
    teamStats,
    salesTrends,
    loading,
    error,
    refresh
  }
}

/**
 * Hook pre-configurado para Corporate Admin Dashboard
 */
export const useCorporateDashboard = () => {
  return useDashboardData({
    includeTeamStats: true,
    includeTrends: true,
    vehiclesLimit: 20
  })
}

/**
 * Hook pre-configurado para Dealer Dashboard
 */
export const useDealerDashboard = () => {
  return useDashboardData({
    includeTeamStats: true,
    includeTrends: true,
    vehiclesLimit: 15
  })
}

/**
 * Hook pre-configurado para Seller Dashboard
 */
export const useSellerDashboard = () => {
  return useDashboardData({
    includeTeamStats: false,
    includeTrends: false,
    vehiclesLimit: 10
  })
}
