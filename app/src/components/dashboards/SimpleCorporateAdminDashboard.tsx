import React, { useState, useEffect } from 'react';
import DealerDashboard from './DealerDashboard';
import { dashboardService, getCurrentUserInfo, type CorporateMetrics } from '../../services/dashboardService';

interface CorporateStats {
  totalTenants: number;
  totalVehicles: number;
  totalUsers: number;
  totalRevenue: number;
  monthlySales: number;
  activeRegions: number;
}

interface TenantData {
  id: string;
  name: string;
  region: string;
  type: 'dealership' | 'regional' | 'other';
  vehicles: number;
  users: number;
  revenue: number;
  status: 'active' | 'inactive';
}

interface RegionalAdmin {
  id: string;
  name: string;
  email: string;
  region: string;
  tenantsManaged: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

function SimpleCorporateAdminDashboard() {
  const [stats, setStats] = useState<CorporateStats | null>(null);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [regionalAdmins, setRegionalAdmins] = useState<RegionalAdmin[]>([]);
  const [metrics, setMetrics] = useState<CorporateMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'regional-admins' | 'dealer-view' | 'analytics'>('overview');
  
  // Estados para modales
  const [showRegionalAdminModal, setShowRegionalAdminModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'regional', id: string, name: string} | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Obtener información del usuario actual
      const userInfo = await getCurrentUserInfo();
      
      if (!userInfo?.tenant_id) {
        console.error('User does not have tenant_id');
        return;
      }

      // Obtener métricas corporativas reales
      const metrics: CorporateMetrics = await dashboardService.getCorporateMetrics(userInfo.tenant_id);
      
      // Convertir métricas a formato del dashboard existente
      const realStats: CorporateStats = {
        totalTenants: 1, // Por ahora solo el tenant del usuario
        totalVehicles: metrics.totalVehicles,
        totalUsers: 0, // TODO: implementar conteo de usuarios
        totalRevenue: 0, // TODO: implementar cálculo de revenue
        monthlySales: metrics.salesThisMonth,
        activeRegions: metrics.topBranches.length
      };

      // Para mantener la UI existente, vamos a generar datos de tenant basados en las métricas
      const realTenantData: TenantData[] = [{
        id: userInfo.tenant_id,
        name: userInfo.tenant_id === 'toyota-centro' ? 'Toyota Centro' : 
              userInfo.tenant_id === 'premium-motors' ? 'Premium Motors' :
              userInfo.tenant_id === 'ford-chile' ? 'Ford Chile' :
              userInfo.tenant_id === 'nissan-chile' ? 'Nissan Chile' : 'Tenant Principal',
        region: 'Metropolitana',
        type: 'dealership',
        vehicles: metrics.totalVehicles,
        users: 0, // TODO: implementar
        revenue: 0, // TODO: implementar
        status: 'active'
      }];

      // Mock de regional admins (mantener UI existente)
      const mockRegionalAdmins: RegionalAdmin[] = [
        {
          id: 'ra1',
          name: 'Gerente Regional',
          email: `gerente@${userInfo.tenant_id}.com`,
          region: 'Metropolitana',
          tenantsManaged: 1,
          status: 'active',
          createdAt: '2024-01-15'
        }
      ];

      setStats(realStats);
      setTenants(realTenantData);
      setRegionalAdmins(mockRegionalAdmins);
      setMetrics(metrics);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  // Funciones para gestionar administradores regionales
  const handleCreateRegionalAdmin = (formData: any) => {
    const newAdmin: RegionalAdmin = {
      id: 'ra' + (regionalAdmins.length + 1),
      name: formData.name,
      email: formData.email,
      region: formData.region,
      tenantsManaged: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRegionalAdmins([...regionalAdmins, newAdmin]);
    setShowRegionalAdminModal(false);
  };

  const handleDeleteRegionalAdmin = (id: string) => {
    setRegionalAdmins(regionalAdmins.filter(admin => admin.id !== id));
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const confirmDelete = (type: 'regional', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (deleteTarget) {
      handleDeleteRegionalAdmin(deleteTarget.id);
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg">Cargando dashboard corporativo...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      {/* Header Corporativo */}
      <header className="dashboard-header">
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="header-text">🏛️ Dashboard Corporativo</h1>
              <p className="header-text opacity-90">Gestión Global AutoMarket Chile</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
              <p className="text-white font-semibold">corporate@automarket.com</p>
              <p className="text-blue-100">Administrador Corporativo</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Navegación de tabs */}
        <nav className="nav-tabs">
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: '📊 Resumen General' },
              { key: 'tenants', label: '🏢 Gestión de Sucursales' },
              { key: 'regional-admins', label: '👨‍💼 Administradores Regionales' },
              { key: 'dealer-view', label: '🚗 Vista de Dealer' },
              { key: 'analytics', label: '📈 Análisis y Reportes' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Contenido del tab activo */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card-modern">
                <div className="stat-icon">🏢</div>
                <h3>Total Sucursales</h3>
                <p>{stats?.totalTenants}</p>
              </div>
              <div className="stat-card-modern green">
                <div className="stat-icon">🚗</div>
                <h3>Total Vehículos</h3>
                <p>{stats?.totalVehicles.toLocaleString()}</p>
              </div>
              <div className="stat-card-modern purple">
                <div className="stat-icon">👥</div>
                <h3>Total Usuarios</h3>
                <p>{stats?.totalUsers}</p>
              </div>
            </div>

            {/* Métricas financieras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="stat-card-modern orange">
                <div className="stat-icon">💰</div>
                <h3>Leads del Mes</h3>
                <p>{metrics?.leadsThisMonth || 0}</p>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">📈</div>
                <h3>Ventas Mensuales</h3>
                <p>{metrics?.salesThisMonth || 0}</p>
              </div>
            </div>

            {/* Métricas de rendimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Sucursales */}
              <div className="dashboard-section">
                <h2 className="section-title">🏆 Top Sucursales por Ventas</h2>
                <div className="bg-white rounded-lg p-4">
                  {metrics?.topBranches && metrics.topBranches.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.topBranches.map((branch, index) => (
                        <div key={branch.name} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold mr-3">
                              {index + 1}
                            </span>
                            <span className="font-medium">{branch.name}</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">{branch.sales} ventas</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay datos de ventas por sucursal</p>
                  )}
                </div>
              </div>

              {/* Top Vendedores */}
              <div className="dashboard-section">
                <h2 className="section-title">👨‍💼 Top Vendedores</h2>
                <div className="bg-white rounded-lg p-4">
                  {metrics?.topSellers && metrics.topSellers.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.topSellers.map((seller, index) => (
                        <div key={seller.name} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-sm font-bold mr-3">
                              {index + 1}
                            </span>
                            <span className="font-medium">{seller.name}</span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">{seller.sales} ventas</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay datos de ventas por vendedor</p>
                  )}
                </div>
              </div>
            </div>

            {/* Estado de vehículos */}
            {metrics?.vehiclesByStatus && metrics.vehiclesByStatus.length > 0 && (
              <div className="dashboard-section">
                <h2 className="section-title">🚗 Estado de Vehículos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.vehiclesByStatus.map((statusItem) => (
                    <div key={statusItem.status} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                      <h4 className="font-semibold text-gray-900 capitalize">{statusItem.status}</h4>
                      <p className="text-2xl font-bold text-blue-600">{statusItem.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen de regiones */}
            <div className="dashboard-section">
              <h2 className="section-title">📍 Resumen por Regiones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Metropolitana', 'Valparaíso', 'Bío Bío', 'Coquimbo', 'Araucanía'].map((region, index) => (
                  <div key={region} className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900">{region}</h4>
                    <p className="text-sm text-gray-600">{Math.floor(Math.random() * 5) + 2} sucursales</p>
                    <p className="text-lg font-bold text-blue-600">
                      {(Math.random() * 500 + 100).toFixed(0)} vehículos
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="dashboard-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">🏢 Gestión de Sucursales</h2>
              <button className="btn btn-primary">
                + Agregar Sucursal
              </button>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <table>
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th>Región</th>
                    <th>Vehículos</th>
                    <th>Usuarios</th>
                    <th>Ingresos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td>
                        <div>
                          <div className="font-semibold text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">ID: {tenant.id}</div>
                        </div>
                      </td>
                      <td className="text-gray-700">{tenant.region}</td>
                      <td className="font-semibold">{tenant.vehicles}</td>
                      <td className="font-semibold">{tenant.users}</td>
                      <td className="font-semibold text-green-600">
                        ${(tenant.revenue / 1000000000).toFixed(1)}B
                      </td>
                      <td>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          tenant.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tenant.status === 'active' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Ver
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm">
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'regional-admins' && (
          <div className="dashboard-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">👨‍💼 Administradores Regionales</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowRegionalAdminModal(true)}
              >
                + Crear Administrador Regional
              </button>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <table>
                <thead>
                  <tr>
                    <th>Administrador</th>
                    <th>Email</th>
                    <th>Región</th>
                    <th>Sucursales</th>
                    <th>Estado</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {regionalAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div>
                          <div className="font-semibold text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">ID: {admin.id}</div>
                        </div>
                      </td>
                      <td className="text-gray-700">{admin.email}</td>
                      <td className="text-gray-700">{admin.region}</td>
                      <td className="font-semibold">{admin.tenantsManaged}</td>
                      <td>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          admin.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-gray-700">{admin.createdAt}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Ver
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm">
                            Editar
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 text-sm"
                            onClick={() => confirmDelete('regional', admin.id, admin.name)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dealer-view' && (
          <div className="dashboard-section">
            <div className="section-header mb-6">
              <h2 className="section-title">🚗 Vista de Dashboard de Dealer</h2>
              <p className="text-gray-600">
                Vista completa del dashboard de un concesionario para monitoreo y análisis corporativo
              </p>
            </div>
            
            <div className="embedded-dashboard-container">
              <DealerDashboard 
                dealerInfo={{
                  name: 'AutoMarket Santiago Centro',
                  email: 'santiago.centro@automarket.com',
                  location: 'Santiago Centro'
                }}
                isEmbedded={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="dashboard-section">
            <h2 className="section-title">📈 Análisis y Reportes</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Panel de Análisis Avanzado
              </h3>
              <p className="text-gray-500 mb-6">
                Aquí se mostrarían gráficos detallados, reportes de ventas, análisis de tendencias y KPIs corporativos.
              </p>
              <button className="btn btn-primary">
                Generar Reporte Completo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear administrador regional */}
      {showRegionalAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Crear Administrador Regional</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateRegionalAdmin({
                name: formData.get('name'),
                email: formData.get('email'),
                region: formData.get('region')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="juan.perez@automarket.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Región
                  </label>
                  <select
                    name="region"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar región</option>
                    <option value="Metropolitana">Metropolitana</option>
                    <option value="Valparaíso">Valparaíso</option>
                    <option value="Bío Bío">Bío Bío</option>
                    <option value="Coquimbo">Coquimbo</option>
                    <option value="Araucanía">Araucanía</option>
                    <option value="Maule">Maule</option>
                    <option value="Los Lagos">Los Lagos</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegionalAdminModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Confirmar Eliminación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar a{' '}
              <span className="font-semibold">{deleteTarget.name}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleCorporateAdminDashboard;