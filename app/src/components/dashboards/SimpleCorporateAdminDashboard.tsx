import React, { useState, useEffect } from 'react';
import DealerDashboard from './DealerDashboard';

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
    
    // Simular datos corporativos
    const mockStats: CorporateStats = {
      totalTenants: 15,
      totalVehicles: 2340,
      totalUsers: 156,
      totalRevenue: 24500000000, // $24.5B CLP
      monthlySales: 450,
      activeRegions: 8
    };

    const mockTenants: TenantData[] = [
      {
        id: '1',
        name: 'AutoMarket Santiago Centro',
        region: 'Metropolitana',
        type: 'dealership',
        vehicles: 450,
        users: 25,
        revenue: 8500000000,
        status: 'active'
      },
      {
        id: '2',
        name: 'AutoMarket Valparaíso',
        region: 'Valparaíso',
        type: 'dealership',
        vehicles: 280,
        users: 18,
        revenue: 4200000000,
        status: 'active'
      },
      {
        id: '3',
        name: 'AutoMarket Concepción',
        region: 'Bío Bío',
        type: 'dealership',
        vehicles: 320,
        users: 22,
        revenue: 5100000000,
        status: 'active'
      },
      {
        id: '4',
        name: 'AutoMarket La Serena',
        region: 'Coquimbo',
        type: 'dealership',
        vehicles: 180,
        users: 12,
        revenue: 2800000000,
        status: 'active'
      },
      {
        id: '5',
        name: 'AutoMarket Temuco',
        region: 'Araucanía',
        type: 'dealership',
        vehicles: 220,
        users: 15,
        revenue: 3400000000,
        status: 'active'
      }
    ];

    const mockRegionalAdmins: RegionalAdmin[] = [
      {
        id: 'ra1',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@automarket.com',
        region: 'Metropolitana',
        tenantsManaged: 5,
        status: 'active',
        createdAt: '2024-01-15'
      },
      {
        id: 'ra2',
        name: 'María González',
        email: 'maria.gonzalez@automarket.com',
        region: 'Valparaíso',
        tenantsManaged: 3,
        status: 'active',
        createdAt: '2024-02-10'
      },
      {
        id: 'ra3',
        name: 'Pedro Sánchez',
        email: 'pedro.sanchez@automarket.com',
        region: 'Bío Bío',
        tenantsManaged: 4,
        status: 'active',
        createdAt: '2024-03-05'
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setTenants(mockTenants);
      setRegionalAdmins(mockRegionalAdmins);
      setIsLoading(false);
    }, 1000);
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
                <h3>Ingresos Totales</h3>
                <p>${(stats?.totalRevenue! / 1000000000).toFixed(1)}M</p>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">📈</div>
                <h3>Ventas Mensuales</h3>
                <p>{stats?.monthlySales}</p>
              </div>
            </div>

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