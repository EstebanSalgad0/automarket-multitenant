import React, { useState, useEffect } from 'react';
import DealerDashboard from './DealerDashboard';
import SellerDashboard from './SellerDashboard';
import { dashboardService, getCurrentUserInfo, type BranchMetrics } from '../../services/dashboardService';

interface RegionalStats {
  totalDealers: number;
  totalVehicles: number;
  totalSellers: number;
  monthlyRevenue: number;
  activeSellers: number;
  totalSales: number;
}

interface DealerData {
  id: string;
  name: string;
  city: string;
  vehicles: number;
  sellers: number;
  revenue: number;
  status: 'active' | 'inactive';
}

interface SellerData {
  id: string;
  name: string;
  email: string;
  dealer: string;
  vehicles: number;
  sales: number;
  status: 'active' | 'inactive';
}

function SimpleRegionalAdminDashboard() {
  const [stats, setStats] = useState<RegionalStats | null>(null);
  const [dealers, setDealers] = useState<DealerData[]>([]);
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [branchMetrics, setBranchMetrics] = useState<BranchMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'dealers' | 'sellers' | 'dealer-view' | 'seller-view'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // Obtener información del usuario actual (gerente de sucursal)
      const userInfo = await getCurrentUserInfo();
      
      if (!userInfo?.branch_id) {
        console.error('User does not have branch_id');
        return;
      }

      // Obtener métricas de la sucursal
      const metrics: BranchMetrics = await dashboardService.getBranchMetrics(userInfo.branch_id);
      
      // Convertir métricas a formato del dashboard existente
      const realStats: RegionalStats = {
        totalDealers: 1, // Solo la sucursal actual
        totalVehicles: metrics.totalVehicles,
        totalSellers: metrics.sellers.length,
        monthlyRevenue: 0, // TODO: implementar cálculo de revenue
        activeSellers: metrics.sellers.filter(s => s.sales > 0).length,
        totalSales: metrics.sellers.reduce((sum, s) => sum + s.sales, 0)
      };

      // Convertir datos de sucursal
      const dealerData: DealerData[] = [{
        id: userInfo.branch_id,
        name: 'Mi Sucursal', // TODO: obtener nombre real de la sucursal
        city: 'Santiago', // TODO: obtener ciudad real
        vehicles: metrics.totalVehicles,
        sellers: metrics.sellers.length,
        revenue: 0, // TODO: implementar
        status: 'active'
      }];

      // Convertir datos de vendedores
      const sellersData: SellerData[] = metrics.sellers.map((seller, index) => ({
        id: `seller_${index}`,
        name: seller.name,
        email: `${seller.name.toLowerCase().replace(' ', '.')}@email.com`,
        dealer: 'Mi Sucursal',
        vehicles: 0, // TODO: obtener vehículos por vendedor
        sales: seller.sales,
        status: 'active'
      }));

      setStats(realStats);
      setDealers(dealerData);
      setSellers(sellersData);
      setBranchMetrics(metrics);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading branch dashboard data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
        <p className="mt-4 text-lg">Cargando dashboard regional...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      {/* Header Regional */}
      <header className="dashboard-header green">
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="header-text">🌎 Dashboard Regional</h1>
              <p className="header-text opacity-90">Gestión Regional - Metropolitana</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
              <p className="text-white font-semibold">regional@automarket.com</p>
              <p className="text-green-100">Administrador Regional</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Navegación de tabs */}
        <nav className="nav-tabs">
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: '📊 Resumen Regional' },
              { key: 'dealers', label: '🏢 Gestión de Dealers' },
              { key: 'sellers', label: '👥 Gestión de Vendedores' },
              { key: 'dealer-view', label: '🚗 Vista de Dealer' },
              { key: 'seller-view', label: '👤 Vista de Vendedor' }
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
              <div className="stat-card-modern green">
                <div className="stat-icon">🏢</div>
                <h3>Total Dealers</h3>
                <p>{stats?.totalDealers}</p>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">🚗</div>
                <h3>Total Vehículos</h3>
                <p>{stats?.totalVehicles}</p>
              </div>
              <div className="stat-card-modern purple">
                <div className="stat-icon">👥</div>
                <h3>Vendedores Activos</h3>
                <p>{stats?.activeSellers}/{stats?.totalSellers}</p>
              </div>
            </div>

            {/* Métricas de rendimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="stat-card-modern orange">
                <div className="stat-icon">�</div>
                <h3>Leads Asignados</h3>
                <p>{branchMetrics?.leads || 0}</p>
              </div>
              <div className="stat-card-modern green">
                <div className="stat-icon">📈</div>
                <h3>Ventas del Mes</h3>
                <p>{stats?.totalSales}</p>
              </div>
            </div>

            {/* Métricas de inventario y estado */}
            {branchMetrics?.inventoryByBrand && branchMetrics.inventoryByBrand.length > 0 && (
              <div className="dashboard-section">
                <h2 className="section-title">📊 Inventario por Marca</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {branchMetrics.inventoryByBrand.map((item) => (
                    <div key={item.brand} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                      <h4 className="font-semibold text-gray-900">{item.brand}</h4>
                      <p className="text-2xl font-bold text-green-600">{item.count}</p>
                      <p className="text-sm text-gray-500">vehículos</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado de vehículos */}
            {branchMetrics?.vehiclesByStatus && branchMetrics.vehiclesByStatus.length > 0 && (
              <div className="dashboard-section">
                <h2 className="section-title">🚗 Estado de Vehículos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {branchMetrics.vehiclesByStatus.map((statusItem) => (
                    <div key={statusItem.status} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                      <h4 className="font-semibold text-gray-900 capitalize">{statusItem.status}</h4>
                      <p className="text-2xl font-bold text-blue-600">{statusItem.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rendimiento de vendedores */}
            {branchMetrics?.sellers && branchMetrics.sellers.length > 0 && (
              <div className="dashboard-section">
                <h2 className="section-title">👨‍� Rendimiento de Vendedores</h2>
                <div className="bg-white rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="thead-green">
                      <tr>
                        <th className="px-6 py-3 text-left">Vendedor</th>
                        <th className="px-6 py-3 text-left">Ventas</th>
                        <th className="px-6 py-3 text-left">Rendimiento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {branchMetrics.sellers.map((seller, index) => (
                        <tr key={seller.name}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{seller.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-green-600">{seller.sales}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              seller.sales > 3 ? 'bg-green-100 text-green-800' :
                              seller.sales > 1 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {seller.sales > 3 ? 'Excelente' : 
                               seller.sales > 1 ? 'Bueno' : 'Necesita mejorar'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Performers */}
            <div className="dashboard-section">
              <h2 className="section-title">🏆 Top Performers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">🥇 Mejor Dealer</h4>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">AutoMarket Santiago Norte</p>
                    <p className="text-sm text-gray-600">120 vehículos • $850M ingresos</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">⭐ Mejor Vendedor</h4>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">Carlos Mendoza</p>
                    <p className="text-sm text-gray-600">15 vehículos • 8 ventas este mes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dealers' && (
          <div className="dashboard-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">🏢 Gestión de Dealers</h2>
              <button className="btn btn-primary">
                + Agregar Dealer
              </button>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <table>
                <thead className="thead-green">
                  <tr>
                    <th>Dealer</th>
                    <th>Ciudad</th>
                    <th>Vehículos</th>
                    <th>Vendedores</th>
                    <th>Ingresos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dealers.map((dealer) => (
                    <tr key={dealer.id}>
                      <td>
                        <div>
                          <div className="font-semibold text-gray-900">{dealer.name}</div>
                          <div className="text-sm text-gray-500">ID: {dealer.id}</div>
                        </div>
                      </td>
                      <td className="text-gray-700">{dealer.city}</td>
                      <td className="font-semibold">{dealer.vehicles}</td>
                      <td className="font-semibold">{dealer.sellers}</td>
                      <td className="font-semibold text-green-600">
                        ${(dealer.revenue / 1000000).toFixed(0)}M
                      </td>
                      <td>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          dealer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {dealer.status === 'active' ? 'Activo' : 'Inactivo'}
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

        {activeTab === 'sellers' && (
          <div className="dashboard-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">👥 Gestión de Vendedores</h2>
              <button className="btn btn-primary">
                + Agregar Vendedor
              </button>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <table>
                <thead className="thead-purple">
                  <tr>
                    <th>Vendedor</th>
                    <th>Email</th>
                    <th>Dealer</th>
                    <th>Vehículos</th>
                    <th>Ventas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr key={seller.id}>
                      <td>
                        <div>
                          <div className="font-semibold text-gray-900">{seller.name}</div>
                          <div className="text-sm text-gray-500">ID: {seller.id}</div>
                        </div>
                      </td>
                      <td className="text-gray-700">{seller.email}</td>
                      <td className="text-gray-700">{seller.dealer}</td>
                      <td className="font-semibold">{seller.vehicles}</td>
                      <td className="font-semibold text-green-600">{seller.sales}</td>
                      <td>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          seller.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {seller.status === 'active' ? 'Activo' : 'Inactivo'}
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
        {activeTab === 'dealer-view' && (
          <div className="dashboard-section">
            <div className="section-header mb-6">
              <h2 className="section-title">🚗 Vista de Dashboard de Dealer</h2>
              <p className="text-gray-600">
                Vista completa del dashboard de un dealer/concesionario para supervisión regional
              </p>
            </div>
            
            <div className="embedded-dashboard-container">
              <DealerDashboard 
                dealerInfo={{
                  name: 'AutoMarket Santiago Norte',
                  email: 'santiago.norte@automarket.com',
                  location: 'Santiago Norte'
                }}
                isEmbedded={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'seller-view' && (
          <div className="dashboard-section">
            <div className="section-header mb-6">
              <h2 className="section-title">👤 Vista de Dashboard de Vendedor</h2>
              <p className="text-gray-600">
                Vista completa del dashboard de un vendedor independiente para supervisión regional
              </p>
            </div>
            
            <div className="embedded-dashboard-container">
              <SellerDashboard 
                sellerInfo={{
                  name: 'Carlos Mendoza',
                  email: 'carlos.mendoza@automarket.com',
                  type: 'Vendedor Independiente'
                }}
                isEmbedded={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimpleRegionalAdminDashboard;