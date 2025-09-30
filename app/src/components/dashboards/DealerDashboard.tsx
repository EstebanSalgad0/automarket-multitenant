import React, { useState } from 'react';

interface DealerDashboardProps {
  dealerInfo?: {
    name: string;
    email: string;
    location: string;
  };
  isEmbedded?: boolean;
}

const DealerDashboard: React.FC<DealerDashboardProps> = ({ 
  dealerInfo = {
    name: 'AutoMarket Las Condes',
    email: 'dealer@automarket.com',
    location: 'Las Condes'
  },
  isEmbedded = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'leads'>('overview');
  
  const containerClass = isEmbedded ? 'embedded-dashboard' : 'dashboard-main';
  
  return (
    <div className={containerClass}>
      {/* Header Dealer */}
      {!isEmbedded && (
        <header className="dashboard-header orange">
          <div className="container">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="header-text">🏢 Dashboard de Concesionario</h1>
                <p className="header-text opacity-90">{dealerInfo.name}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <p className="text-white font-semibold">{dealerInfo.email}</p>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className={isEmbedded ? '' : 'container'}>
        {/* Navigation Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Resumen
          </button>
          <button 
            className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            🚗 Inventario
          </button>
          <button 
            className={`tab ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            👥 Leads
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card orange">
                <div className="stat-icon">🚗</div>
                <div>
                  <h3 className="stat-number">24</h3>
                  <p className="stat-label">Vehículos en Stock</p>
                </div>
              </div>
              <div className="stat-card blue">
                <div className="stat-icon">💰</div>
                <div>
                  <h3 className="stat-number">$450,000</h3>
                  <p className="stat-label">Ventas Este Mes</p>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">📈</div>
                <div>
                  <h3 className="stat-number">89%</h3>
                  <p className="stat-label">Satisfacción Cliente</p>
                </div>
              </div>
              <div className="stat-card purple">
                <div className="stat-icon">👥</div>
                <div>
                  <h3 className="stat-number">43</h3>
                  <p className="stat-label">Consultas Pendientes</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="section">
              <h2 className="section-title">Actividad Reciente</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon green">✅</div>
                  <div>
                    <p className="activity-title">Venta Completada</p>
                    <p className="activity-desc">Toyota Camry 2023 - $28,500</p>
                    <span className="activity-time">Hace 2 horas</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon blue">📞</div>
                  <div>
                    <p className="activity-title">Nueva Consulta</p>
                    <p className="activity-desc">Cliente interesado en Honda Civic</p>
                    <span className="activity-time">Hace 4 horas</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon orange">🚗</div>
                  <div>
                    <p className="activity-title">Vehículo Agregado</p>
                    <p className="activity-desc">Ford Explorer 2024</p>
                    <span className="activity-time">Ayer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div className="section">
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-title">Inventario de Vehículos</h2>
                <button className="btn-primary">+ Agregar Vehículo</button>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vehículo</th>
                      <th>Año</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Días en Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div>
                          <p className="font-semibold">Toyota Camry</p>
                          <p className="text-gray-500">Sedán • Automático</p>
                        </div>
                      </td>
                      <td>2023</td>
                      <td className="font-semibold">$28,500</td>
                      <td><span className="badge green">Disponible</span></td>
                      <td>15</td>
                      <td>
                        <button className="btn-outline-sm">Ver</button>
                        <button className="btn-outline-sm ml-2">Editar</button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div>
                          <p className="font-semibold">Honda Civic</p>
                          <p className="text-gray-500">Sedán • Manual</p>
                        </div>
                      </td>
                      <td>2023</td>
                      <td className="font-semibold">$22,000</td>
                      <td><span className="badge red">Vendido</span></td>
                      <td>-</td>
                      <td>
                        <button className="btn-outline-sm">Ver</button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div>
                          <p className="font-semibold">Ford Explorer</p>
                          <p className="text-gray-500">SUV • Automático</p>
                        </div>
                      </td>
                      <td>2024</td>
                      <td className="font-semibold">$35,000</td>
                      <td><span className="badge green">Disponible</span></td>
                      <td>3</td>
                      <td>
                        <button className="btn-outline-sm">Ver</button>
                        <button className="btn-outline-sm ml-2">Editar</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div>
            <div className="section">
              <h2 className="section-title">Consultas y Leads</h2>
              
              <div className="leads-grid">
                <div className="lead-card">
                  <div className="lead-header">
                    <h3 className="lead-name">María González</h3>
                    <span className="badge blue">Nuevo</span>
                  </div>
                  <p className="lead-interest">Interesada en: Toyota Camry 2023</p>
                  <p className="lead-contact">📧 maria.gonzalez@email.com</p>
                  <p className="lead-contact">📱 +56 9 8765 4321</p>
                  <div className="lead-actions">
                    <button className="btn-primary-sm">Contactar</button>
                    <button className="btn-outline-sm">Ver Perfil</button>
                  </div>
                </div>

                <div className="lead-card">
                  <div className="lead-header">
                    <h3 className="lead-name">Carlos Mendoza</h3>
                    <span className="badge orange">En proceso</span>
                  </div>
                  <p className="lead-interest">Interesado en: Honda Civic 2023</p>
                  <p className="lead-contact">📧 carlos.mendoza@email.com</p>
                  <p className="lead-contact">📱 +56 9 1234 5678</p>
                  <div className="lead-actions">
                    <button className="btn-primary-sm">Seguimiento</button>
                    <button className="btn-outline-sm">Ver Perfil</button>
                  </div>
                </div>

                <div className="lead-card">
                  <div className="lead-header">
                    <h3 className="lead-name">Ana Rojas</h3>
                    <span className="badge green">Calificado</span>
                  </div>
                  <p className="lead-interest">Interesada en: Ford Explorer 2024</p>
                  <p className="lead-contact">📧 ana.rojas@email.com</p>
                  <p className="lead-contact">📱 +56 9 5555 0000</p>
                  <div className="lead-actions">
                    <button className="btn-primary-sm">Agendar Cita</button>
                    <button className="btn-outline-sm">Ver Perfil</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerDashboard;