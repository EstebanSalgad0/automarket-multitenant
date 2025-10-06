import React, { useState, useEffect } from 'react'
import './CorporateDashboards.css'

interface DashboardStats {
  total_branches: number
  active_branches: number
  total_vehicles: number
  active_leads: number
  total_sales_this_month: number
}

interface Branch {
  id: string
  name: string
  city: string
  status: 'active' | 'inactive' | 'maintenance'
  manager?: {
    full_name: string | null
  }
  vehicle_count?: number
  active_leads_count?: number
}

const CorporateAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_branches: 0,
    active_branches: 0,
    total_vehicles: 0,
    active_leads: 0,
    total_sales_this_month: 0
  })

  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Simulación de datos mientras se ejecuta la migración
      const mockStats: DashboardStats = {
        total_branches: 15,
        active_branches: 14,
        total_vehicles: 1247,
        active_leads: 89,
        total_sales_this_month: 42
      }

      const mockBranches: Branch[] = [
        {
          id: '1',
          name: 'AutoMarket Las Condes',
          city: 'Santiago',
          status: 'active',
          manager: { full_name: 'Carlos Rodriguez' },
          vehicle_count: 85,
          active_leads_count: 12
        },
        {
          id: '2',
          name: 'AutoMarket Providencia',
          city: 'Santiago',
          status: 'active',
          manager: { full_name: 'Maria González' },
          vehicle_count: 67,
          active_leads_count: 8
        },
        {
          id: '3',
          name: 'AutoMarket Valparaíso',
          city: 'Valparaíso',
          status: 'active',
          manager: { full_name: 'Juan Pérez' },
          vehicle_count: 45,
          active_leads_count: 15
        },
        {
          id: '4',
          name: 'AutoMarket Concepción',
          city: 'Concepción',
          status: 'maintenance',
          manager: { full_name: 'Ana Silva' },
          vehicle_count: 23,
          active_leads_count: 3
        }
      ]

      setStats(mockStats)
      setBranches(mockBranches)

      // TODO: Reemplazar con llamadas reales a los servicios cuando esté la migración
      // const [statsData, branchesData] = await Promise.all([
      //   branchService.getBranchStats(),
      //   branchService.getBranches()
      // ])
      // setStats(statsData)
      // setBranches(branchesData)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard corporativo...</p>
      </div>
    )
  }

  return (
    <div className="corporate-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Corporativo</h1>
        <p>Vista general del negocio a nivel nacional</p>
      </div>

      {/* KPIs principales */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">🏢</div>
          <div className="kpi-content">
            <h3>{stats.total_branches}</h3>
            <p>Sucursales Total</p>
            <small>{stats.active_branches} activas</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🚗</div>
          <div className="kpi-content">
            <h3>{stats.total_vehicles.toLocaleString()}</h3>
            <p>Vehículos en Stock</p>
            <small>Inventario nacional</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <h3>{stats.active_leads}</h3>
            <p>Leads Activos</p>
            <small>Oportunidades en proceso</small>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <h3>{stats.total_sales_this_month}</h3>
            <p>Ventas Este Mes</p>
            <small>Meta: 50 unidades</small>
          </div>
        </div>
      </div>

      {/* Vista de sucursales */}
      <div className="dashboard-section">
        <h2>Rendimiento por Sucursal</h2>
        <div className="branches-grid">
          {branches.map(branch => (
            <div key={branch.id} className={`branch-card ${branch.status}`}>
              <div className="branch-header">
                <h3>{branch.name}</h3>
                <span className={`status-badge ${branch.status}`}>
                  {branch.status === 'active' ? 'Activa' : 
                   branch.status === 'inactive' ? 'Inactiva' : 'Mantenimiento'}
                </span>
              </div>
              
              <div className="branch-info">
                <p><strong>Ciudad:</strong> {branch.city}</p>
                <p><strong>Gerente:</strong> {branch.manager?.full_name || 'Sin asignar'}</p>
              </div>

              <div className="branch-metrics">
                <div className="metric">
                  <span className="metric-value">{branch.vehicle_count}</span>
                  <span className="metric-label">Vehículos</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{branch.active_leads_count}</span>
                  <span className="metric-label">Leads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos y análisis */}
      <div className="dashboard-section">
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Distribución Regional</h3>
            <div className="chart-placeholder">
              <div className="region-stats">
                <div className="region-bar">
                  <span>Región Metropolitana</span>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: '65%' }}></div>
                  </div>
                  <span>65%</span>
                </div>
                <div className="region-bar">
                  <span>Valparaíso</span>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: '20%' }}></div>
                  </div>
                  <span>20%</span>
                </div>
                <div className="region-bar">
                  <span>Bío Bío</span>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: '15%' }}></div>
                  </div>
                  <span>15%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Tendencia de Ventas</h3>
            <div className="chart-placeholder">
              <div className="trend-line">
                <div className="trend-points">
                  <div className="trend-point" style={{ left: '10%', bottom: '30%' }}></div>
                  <div className="trend-point" style={{ left: '25%', bottom: '45%' }}></div>
                  <div className="trend-point" style={{ left: '40%', bottom: '35%' }}></div>
                  <div className="trend-point" style={{ left: '55%', bottom: '60%' }}></div>
                  <div className="trend-point" style={{ left: '70%', bottom: '55%' }}></div>
                  <div className="trend-point" style={{ left: '85%', bottom: '70%' }}></div>
                </div>
                <div className="trend-info">
                  <p>↗️ +18% vs mes anterior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y notificaciones */}
      <div className="dashboard-section">
        <h3>Alertas y Notificaciones</h3>
        <div className="alerts-list">
          <div className="alert warning">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <strong>Sucursal en Mantenimiento</strong>
              <p>AutoMarket Concepción está en mantenimiento programado</p>
            </div>
            <small>2 horas</small>
          </div>
          
          <div className="alert info">
            <span className="alert-icon">📊</span>
            <div className="alert-content">
              <strong>Nuevo Reporte Disponible</strong>
              <p>Análisis mensual de ventas listo para revisión</p>
            </div>
            <small>6 horas</small>
          </div>

          <div className="alert success">
            <span className="alert-icon">🎉</span>
            <div className="alert-content">
              <strong>Meta Alcanzada</strong>
              <p>Sucursal Las Condes superó la meta mensual</p>
            </div>
            <small>1 día</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CorporateAdminDashboard