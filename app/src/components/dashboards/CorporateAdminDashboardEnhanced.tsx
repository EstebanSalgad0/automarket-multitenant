import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services/dashboardService'
import type { CorporateAdminMetrics, BranchData, EmployeeData } from '../../services/dashboardService'
import { supabase } from '../../lib/supabase'
import AutoMarketIcon from '../AutoMarketIcon'

interface CorporateAdminDashboardEnhancedProps {
  isEmbedded?: boolean
}

const CorporateAdminDashboardEnhanced: React.FC<CorporateAdminDashboardEnhancedProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'employees' | 'vehicles' | 'analytics'>('overview')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<CorporateAdminMetrics | null>(null)
  const [branches, setBranches] = useState<BranchData[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const { user } = useAuth()

  // Formatear moneda chilena
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CL').format(num)
  }

  const loadCorporateData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Obtener tenant_id del usuario actual - por ahora usaremos un placeholder
      // TODO: Implementar getCurrentUserInfo en dashboardService
      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single() as { data: any }

      if (!userData?.tenant_id) {
        console.error('Usuario no tiene tenant_id asignado')
        return
      }

      // Cargar métricas corporativas
      const corporateMetrics = await dashboardService.getCorporateAdminMetrics(userData.tenant_id)
      setMetrics(corporateMetrics)

      // Cargar sucursales (para la pestaña branches)
      const { data: branchesData } = await supabase
        .from('branches')
        .select('*')
        .eq('tenant_id', userData.tenant_id)
        .order('name')

      setBranches(branchesData || [])

      // Cargar empleados (para la pestaña employees)
      const { data: employeesData } = await supabase
        .from('users')
        .select(`
          id,
          email,
          role,
          branch_id,
          user_profiles!inner(first_name, last_name, phone),
          branches(name),
          created_at
        `)
        .eq('tenant_id', userData.tenant_id)
        .neq('role', 'buyer')
        .order('created_at', { ascending: false })

      const employeesList: EmployeeData[] = employeesData?.map((emp: any) => ({
        id: emp.id,
        email: emp.email,
        role: emp.role,
        branch_id: emp.branch_id,
        first_name: emp.user_profiles.first_name,
        last_name: emp.user_profiles.last_name,
        phone: emp.user_profiles.phone,
        created_at: emp.created_at,
        branch_name: emp.branches?.name
      })) || []

      setEmployees(employeesList)

    } catch (error) {
      console.error('Error loading corporate data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCorporateData()
  }, [user])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '6px solid rgba(255,255,255,0.3)',
            borderTop: '6px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }}></div>
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Cargando Dashboard Corporativo...</p>
        </div>
      </div>
    )
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : 'transparent',
    color: isActive ? 'white' : '#667eea',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    margin: '0 8px',
    transition: 'all 0.3s ease',
    borderWidth: isActive ? '0' : '2px',
    borderStyle: isActive ? 'none' : 'solid',
    borderColor: isActive ? 'transparent' : '#e1e5e9'
  })

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    margin: '16px 0'
  }

  const metricCardStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '24px',
    color: 'white',
    textAlign: 'center' as const,
    minWidth: '200px',
    margin: '8px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '20px 32px', 
        borderBottom: '1px solid #e1e5e9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AutoMarketIcon size={40} />
          <div style={{ marginLeft: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a202c' }}>
              Dashboard Corporativo
            </h1>
            <p style={{ margin: 0, color: '#718096', fontSize: '16px' }}>
              Administración y métricas completas
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#718096', marginRight: '16px' }}>
            👤 {user?.email}
          </span>
          <button 
            onClick={loadCorporateData}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        background: 'white', 
        padding: '16px 32px', 
        borderBottom: '1px solid #e1e5e9',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={tabStyle(activeTab === 'overview')}
        >
          📊 Resumen
        </button>
        <button 
          onClick={() => setActiveTab('branches')}
          style={tabStyle(activeTab === 'branches')}
        >
          🏢 Sucursales
        </button>
        <button 
          onClick={() => setActiveTab('employees')}
          style={tabStyle(activeTab === 'employees')}
        >
          👥 Empleados
        </button>
        <button 
          onClick={() => setActiveTab('vehicles')}
          style={tabStyle(activeTab === 'vehicles')}
        >
          🚗 Vehículos
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={tabStyle(activeTab === 'analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        {activeTab === 'overview' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              📊 Resumen Ejecutivo
            </h2>
            
            {/* Métricas principales */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: '32px' }}>
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.totalEmployees)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Empleados</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.totalBranches)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Sucursales</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatNumber(metrics.totalVehicles)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Vehículos</div>
              </div>
              
              <div style={metricCardStyle}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
                  {formatCurrency(metrics.monthlyRevenue)}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Revenue Mensual</div>
              </div>
            </div>

            {/* Top Performers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                  🏆 Top Sucursales
                </h3>
                {metrics.topPerformingBranches.map((branch, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0',
                    borderBottom: '1px solid #e1e5e9'
                  }}>
                    <span style={{ fontWeight: '600' }}>{branch.branch_name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: '#667eea' }}>
                        {formatCurrency(branch.revenue)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>
                        {branch.sales_count} ventas
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                  🌟 Top Vendedores
                </h3>
                {metrics.topPerformingSellers.map((seller, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0',
                    borderBottom: '1px solid #e1e5e9'
                  }}>
                    <span style={{ fontWeight: '600' }}>{seller.seller_name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: '#667eea' }}>
                        {formatCurrency(seller.revenue)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>
                        {seller.sales_count} ventas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status de Vehículos */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
                🚗 Estado de Vehículos
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {metrics.vehiclesByStatus.map((status, index) => (
                  <div key={index} style={{
                    background: '#f7fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                      {status.count}
                    </div>
                    <div style={{ fontSize: '14px', color: '#718096', textTransform: 'capitalize' }}>
                      {status.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              🏢 Gestión de Sucursales
            </h2>
            
            <div style={cardStyle}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {branches.map((branch) => (
                  <div key={branch.id} style={{
                    padding: '20px',
                    border: '1px solid #e1e5e9',
                    borderRadius: '12px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
                          {branch.name}
                        </h4>
                        <p style={{ color: '#718096', margin: '4px 0' }}>{branch.address}</p>
                        <p style={{ color: '#718096', margin: '4px 0' }}>📞 {branch.phone}</p>
                        <p style={{ color: '#718096', margin: '4px 0' }}>✉️ {branch.email}</p>
                      </div>
                      <button style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}>
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              👥 Gestión de Empleados
            </h2>
            
            <div style={cardStyle}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e1e5e9' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a202c' }}>Nombre</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a202c' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a202c' }}>Rol</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a202c' }}>Sucursal</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1a202c' }}>Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>
                          {employee.first_name} {employee.last_name}
                        </td>
                        <td style={{ padding: '12px', color: '#718096' }}>{employee.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: employee.role === 'corporate_admin' ? '#667eea' : 
                                       employee.role === 'branch_manager' ? '#48bb78' : '#ed8936',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {employee.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#718096' }}>
                          {(employee as any).branch_name || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', color: '#718096' }}>{employee.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              🚗 Gestión de Vehículos
            </h2>
            <div style={cardStyle}>
              <p style={{ textAlign: 'center', color: '#718096', fontSize: '16px', padding: '40px' }}>
                Funcionalidad de gestión de vehículos en desarrollo...
              </p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px' }}>
              📈 Analytics Avanzados
            </h2>
            <div style={cardStyle}>
              <p style={{ textAlign: 'center', color: '#718096', fontSize: '16px', padding: '40px' }}>
                Dashboard de analytics avanzados en desarrollo...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CorporateAdminDashboardEnhanced