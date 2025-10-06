import React, { useState, useEffect } from 'react'
import './CorporateDashboards.css'

interface BranchStats {
  branch_id: string
  branch_name: string
  total_vehicles: number
  active_leads: number
  sales_this_month: number
  team_size: number
}

interface Lead {
  id: string
  customer_name: string
  vehicle_info: string
  status: 'new' | 'contacted' | 'interested' | 'negotiating' | 'sold' | 'lost'
  assigned_to: string
  created_at: string
  priority: 'low' | 'medium' | 'high'
}

const BranchManagerDashboard: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState('las-condes')
  const [branchStats, setBranchStats] = useState<BranchStats>({
    branch_id: 'las-condes',
    branch_name: 'AutoMarket Las Condes',
    total_vehicles: 85,
    active_leads: 12,
    sales_this_month: 8,
    team_size: 5
  })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBranchData()
  }, [selectedBranch])

  const loadBranchData = async () => {
    try {
      setLoading(true)

      // Simulación de datos mientras se ejecuta la migración
      const mockLeads: Lead[] = [
        {
          id: '1',
          customer_name: 'Juan Pérez',
          vehicle_info: 'Toyota Corolla 2020',
          status: 'new',
          assigned_to: 'Carlos Rodriguez',
          created_at: '2024-01-15T10:00:00Z',
          priority: 'high'
        },
        {
          id: '2',
          customer_name: 'María González',
          vehicle_info: 'Honda Civic 2019',
          status: 'contacted',
          assigned_to: 'Ana Silva',
          created_at: '2024-01-14T15:30:00Z',
          priority: 'medium'
        },
        {
          id: '3',
          customer_name: 'Pedro Morales',
          vehicle_info: 'Nissan Sentra 2021',
          status: 'interested',
          assigned_to: 'Luis Castro',
          created_at: '2024-01-13T09:15:00Z',
          priority: 'high'
        },
        {
          id: '4',
          customer_name: 'Carmen López',
          vehicle_info: 'Hyundai Accent 2020',
          status: 'negotiating',
          assigned_to: 'Sofia Ruiz',
          created_at: '2024-01-12T14:45:00Z',
          priority: 'high'
        }
      ]

      setRecentLeads(mockLeads)

      // TODO: Reemplazar con llamadas reales cuando esté la migración
      // const [statsData, leadsData] = await Promise.all([
      //   branchService.getBranchStats(selectedBranch),
      //   leadService.getLeadsByBranch(selectedBranch)
      // ])
      // setBranchStats(statsData)
      // setRecentLeads(leadsData.slice(0, 10))

    } catch (error) {
      console.error('Error loading branch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return '#17a2b8'
      case 'contacted': return '#ffc107'
      case 'interested': return '#28a745'
      case 'negotiating': return '#fd7e14'
      case 'sold': return '#28a745'
      case 'lost': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getPriorityIcon = (priority: Lead['priority']) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚫'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="branch-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard de Sucursal</h1>
        <p>Gestión y seguimiento de {branchStats.branch_name}</p>
        
        <div className="branch-selector">
          <label htmlFor="branch-select">Sucursal: </label>
          <select 
            id="branch-select"
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="las-condes">AutoMarket Las Condes</option>
            <option value="providencia">AutoMarket Providencia</option>
            <option value="valparaiso">AutoMarket Valparaíso</option>
            <option value="concepcion">AutoMarket Concepción</option>
          </select>
        </div>
      </div>

      {/* KPIs de la sucursal */}
      <div className="performance-grid">
        <div className="performance-card">
          <div className="performance-value">{branchStats.total_vehicles}</div>
          <div className="performance-label">Vehículos en Stock</div>
        </div>

        <div className="performance-card">
          <div className="performance-value">{branchStats.active_leads}</div>
          <div className="performance-label">Leads Activos</div>
        </div>

        <div className="performance-card">
          <div className="performance-value">{branchStats.sales_this_month}</div>
          <div className="performance-label">Ventas del Mes</div>
        </div>

        <div className="performance-card">
          <div className="performance-value">{branchStats.team_size}</div>
          <div className="performance-label">Equipo de Ventas</div>
        </div>
      </div>

      {/* Tabla de leads recientes */}
      <div className="dashboard-section">
        <h3>Leads Recientes</h3>
        {loading ? (
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Cargando leads...</p>
          </div>
        ) : (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Prioridad</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Estado</th>
                <th>Asignado a</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(lead => (
                <tr key={lead.id}>
                  <td>{getPriorityIcon(lead.priority)}</td>
                  <td>
                    <strong>{lead.customer_name}</strong>
                  </td>
                  <td>{lead.vehicle_info}</td>
                  <td>
                    <span 
                      className="lead-status" 
                      style={{ 
                        backgroundColor: getStatusColor(lead.status) + '20',
                        color: getStatusColor(lead.status)
                      }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.assigned_to}</td>
                  <td>{formatDate(lead.created_at)}</td>
                  <td>
                    <button 
                      className="btn-sm btn-primary"
                      onClick={() => console.log('Ver lead:', lead.id)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="dashboard-section">
        <h3>Acciones Rápidas</h3>
        <div className="quick-actions">
          <button className="action-btn">
            <span className="action-icon">👥</span>
            <span>Gestionar Equipo</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">🚗</span>
            <span>Inventario</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>Reportes</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">⚙️</span>
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* Alertas importantes */}
      <div className="dashboard-section">
        <h3>Alertas y Recordatorios</h3>
        <div className="alerts-list">
          <div className="alert warning">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <strong>Inventario Bajo</strong>
              <p>Solo quedan 3 unidades de Toyota Corolla disponibles</p>
            </div>
            <small>1 hora</small>
          </div>
          
          <div className="alert info">
            <span className="alert-icon">📅</span>
            <div className="alert-content">
              <strong>Reunión Programada</strong>
              <p>Revisión semanal de ventas hoy a las 15:00</p>
            </div>
            <small>3 horas</small>
          </div>

          <div className="alert success">
            <span className="alert-icon">🎯</span>
            <div className="alert-content">
              <strong>Meta Mensual</strong>
              <p>80% de la meta alcanzada (8/10 ventas)</p>
            </div>
            <small>Actualizado</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BranchManagerDashboard