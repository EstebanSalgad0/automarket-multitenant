import React, { useState, useEffect } from 'react'
import './CorporateDashboards.css'

interface SalesPersonStats {
  sales_person_id: string
  name: string
  assigned_leads: number
  contacted_leads: number
  sales_this_month: number
  conversion_rate: number
  target_month: number
}

interface MyLead {
  id: string
  customer_name: string
  customer_phone: string
  vehicle_info: string
  status: 'new' | 'contacted' | 'interested' | 'negotiating' | 'sold' | 'lost'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  last_contact: string
  notes: string
}

const SalesPersonDashboard: React.FC = () => {
  const [stats, setStats] = useState<SalesPersonStats>({
    sales_person_id: 'sp-001',
    name: 'Carlos Rodriguez',
    assigned_leads: 15,
    contacted_leads: 12,
    sales_this_month: 3,
    conversion_rate: 20,
    target_month: 5
  })

  const [myLeads, setMyLeads] = useState<MyLead[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'new' | 'hot' | 'follow-up'>('all')

  useEffect(() => {
    loadMyData()
  }, [filter])

  const loadMyData = async () => {
    try {
      setLoading(true)

      // Simulación de datos mientras se ejecuta la migración
      const mockLeads: MyLead[] = [
        {
          id: '1',
          customer_name: 'Juan Pérez',
          customer_phone: '+56912345678',
          vehicle_info: 'Toyota Corolla 2020 - $12.500.000',
          status: 'new',
          priority: 'high',
          created_at: '2024-01-15T10:00:00Z',
          last_contact: '2024-01-15T10:00:00Z',
          notes: 'Cliente interesado en financiamiento'
        },
        {
          id: '2',
          customer_name: 'María González',
          customer_phone: '+56987654321',
          vehicle_info: 'Honda Civic 2019 - $11.200.000',
          status: 'contacted',
          priority: 'medium',
          created_at: '2024-01-14T15:30:00Z',
          last_contact: '2024-01-15T09:00:00Z',
          notes: 'Solicita test drive para mañana'
        },
        {
          id: '3',
          customer_name: 'Pedro Morales',
          customer_phone: '+56911111111',
          vehicle_info: 'Nissan Sentra 2021 - $13.800.000',
          status: 'interested',
          priority: 'high',
          created_at: '2024-01-13T09:15:00Z',
          last_contact: '2024-01-14T16:30:00Z',
          notes: 'Muy interesado, está evaluando opciones'
        },
        {
          id: '4',
          customer_name: 'Carmen López',
          customer_phone: '+56922222222',
          vehicle_info: 'Hyundai Accent 2020 - $9.500.000',
          status: 'negotiating',
          priority: 'high',
          created_at: '2024-01-12T14:45:00Z',
          last_contact: '2024-01-15T11:00:00Z',
          notes: 'Negociando precio final y forma de pago'
        },
        {
          id: '5',
          customer_name: 'Roberto Silva',
          customer_phone: '+56933333333',
          vehicle_info: 'Chevrolet Spark 2018 - $7.200.000',
          status: 'contacted',
          priority: 'low',
          created_at: '2024-01-11T08:00:00Z',
          last_contact: '2024-01-13T14:00:00Z',
          notes: 'Requiere más información sobre garantía'
        }
      ]

      // Filtrar leads según filtro seleccionado
      let filteredLeads = mockLeads
      switch (filter) {
        case 'new':
          filteredLeads = mockLeads.filter(lead => lead.status === 'new')
          break
        case 'hot':
          filteredLeads = mockLeads.filter(lead => 
            lead.priority === 'high' && ['interested', 'negotiating'].includes(lead.status)
          )
          break
        case 'follow-up':
          filteredLeads = mockLeads.filter(lead => {
            const lastContact = new Date(lead.last_contact)
            const now = new Date()
            const daysDiff = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
            return daysDiff >= 2
          })
          break
        default:
          filteredLeads = mockLeads
      }

      setMyLeads(filteredLeads)

      // TODO: Reemplazar con llamadas reales cuando esté la migración
      // const currentUserId = getCurrentUser().id
      // const [statsData, leadsData] = await Promise.all([
      //   leadService.getSalesPersonStats(currentUserId),
      //   leadService.getLeadsByUser(currentUserId)
      // ])
      // setStats(statsData)
      // setMyLeads(leadsData)

    } catch (error) {
      console.error('Error loading sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: MyLead['status']) => {
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

  const getPriorityIcon = (priority: MyLead['priority']) => {
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
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysFromLastContact = (lastContact: string) => {
    const lastContactDate = new Date(lastContact)
    const now = new Date()
    return Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const progressPercentage = (stats.sales_this_month / stats.target_month) * 100

  return (
    <div className="sales-dashboard">
      <div className="dashboard-header">
        <h1>Mi Dashboard de Ventas</h1>
        <p>Bienvenido, {stats.name}</p>
        
        <div className="progress-bar-container">
          <div className="progress-label">
            Meta mensual: {stats.sales_this_month}/{stats.target_month} ventas ({progressPercentage.toFixed(0)}%)
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* KPIs personales */}
      <div className="performance-grid">
        <div className="performance-card">
          <div className="performance-value">{stats.assigned_leads}</div>
          <div className="performance-label">Leads Asignados</div>
        </div>

        <div className="performance-card">
          <div className="performance-value">{stats.contacted_leads}</div>
          <div className="performance-label">Contactados</div>
        </div>

        <div className="performance-card">
          <div className="performance-value">{stats.sales_this_month}</div>
          <div className="performance-label">Ventas del Mes</div>
        </div>

        <div className="performance-card">
          <div className="performance-value">{stats.conversion_rate}%</div>
          <div className="performance-label">Tasa Conversión</div>
        </div>
      </div>

      {/* Filtros de leads */}
      <div className="dashboard-section">
        <div className="filters-header">
          <h3>Mis Leads</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos ({myLeads.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
              onClick={() => setFilter('new')}
            >
              Nuevos
            </button>
            <button 
              className={`filter-btn ${filter === 'hot' ? 'active' : ''}`}
              onClick={() => setFilter('hot')}
            >
              Calientes 🔥
            </button>
            <button 
              className={`filter-btn ${filter === 'follow-up' ? 'active' : ''}`}
              onClick={() => setFilter('follow-up')}
            >
              Seguimiento
            </button>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Cargando mis leads...</p>
          </div>
        ) : (
          <div className="leads-cards">
            {myLeads.map(lead => (
              <div key={lead.id} className="lead-card">
                <div className="lead-card-header">
                  <div className="lead-customer">
                    <h4>{lead.customer_name}</h4>
                    <p>{lead.customer_phone}</p>
                  </div>
                  <div className="lead-priority">
                    {getPriorityIcon(lead.priority)}
                  </div>
                </div>

                <div className="lead-vehicle">
                  <strong>{lead.vehicle_info}</strong>
                </div>

                <div className="lead-status-row">
                  <span 
                    className="lead-status" 
                    style={{ 
                      backgroundColor: getStatusColor(lead.status) + '20',
                      color: getStatusColor(lead.status)
                    }}
                  >
                    {lead.status}
                  </span>
                  
                  <span className="last-contact">
                    Último contacto: hace {getDaysFromLastContact(lead.last_contact)} días
                  </span>
                </div>

                <div className="lead-notes">
                  <small>{lead.notes}</small>
                </div>

                <div className="lead-actions">
                  <button className="btn-sm btn-primary">
                    📞 Llamar
                  </button>
                  <button className="btn-sm btn-secondary">
                    💬 WhatsApp
                  </button>
                  <button className="btn-sm btn-outline">
                    📝 Notas
                  </button>
                </div>
              </div>
            ))}

            {myLeads.length === 0 && (
              <div className="empty-state">
                <p>No hay leads para mostrar con el filtro seleccionado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="dashboard-section">
        <h3>Acciones Rápidas</h3>
        <div className="quick-actions">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span>Nuevo Lead</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">📅</span>
            <span>Agendar Cita</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">🚗</span>
            <span>Test Drive</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>Mi Reporte</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SalesPersonDashboard