import React, { useState } from 'react';

interface SellerDashboardProps {
  sellerInfo?: {
    name: string;
    email: string;
    type: string;
  };
  isEmbedded?: boolean;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({
  sellerInfo = {
    name: 'Vendedor Independiente',
    email: 'vendedor@automarket.com',
    type: 'Vendedor Independiente'
  },
  isEmbedded = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'inquiries'>('overview');
  
  const containerClass = isEmbedded ? 'embedded-dashboard' : 'dashboard-main';
  
  return (
    <div className={containerClass}>
      {/* Header Seller */}
      {!isEmbedded && (
        <header className="dashboard-header green">
          <div className="container">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="header-text">👤 Dashboard de Vendedor</h1>
                <p className="header-text opacity-90">{sellerInfo.type}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <p className="text-white font-semibold">{sellerInfo.email}</p>
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
            className={`tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            🚗 Mis Vehículos
          </button>
          <button 
            className={`tab ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            💬 Consultas
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card green">
                <div className="stat-icon">🚗</div>
                <div>
                  <h3 className="stat-number">5</h3>
                  <p className="stat-label">Vehículos Publicados</p>
                </div>
              </div>
              <div className="stat-card blue">
                <div className="stat-icon">👁️</div>
                <div>
                  <h3 className="stat-number">1,250</h3>
                  <p className="stat-label">Visualizaciones</p>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon">💬</div>
                <div>
                  <h3 className="stat-number">12</h3>
                  <p className="stat-label">Consultas Recibidas</p>
                </div>
              </div>
              <div className="stat-card purple">
                <div className="stat-icon">⭐</div>
                <div>
                  <h3 className="stat-number">4.8</h3>
                  <p className="stat-label">Calificación</p>
                </div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="section">
              <h2 className="section-title">Rendimiento de Publicaciones</h2>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  <div className="chart-bar" style={{height: '60%'}}>
                    <span className="chart-value">250</span>
                    <span className="chart-label">Ene</span>
                  </div>
                  <div className="chart-bar" style={{height: '80%'}}>
                    <span className="chart-value">320</span>
                    <span className="chart-label">Feb</span>
                  </div>
                  <div className="chart-bar" style={{height: '70%'}}>
                    <span className="chart-value">280</span>
                    <span className="chart-label">Mar</span>
                  </div>
                  <div className="chart-bar" style={{height: '90%'}}>
                    <span className="chart-value">360</span>
                    <span className="chart-label">Abr</span>
                  </div>
                  <div className="chart-bar" style={{height: '100%'}}>
                    <span className="chart-value">400</span>
                    <span className="chart-label">May</span>
                  </div>
                </div>
                <p className="chart-title">Visualizaciones Mensuales</p>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div>
            <div className="section">
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-title">Mis Vehículos</h2>
                <button className="btn-primary">+ Publicar Vehículo</button>
              </div>
              
              <div className="vehicles-grid">
                <div className="vehicle-card">
                  <div className="vehicle-image-placeholder">📷</div>
                  <div className="vehicle-info">
                    <h3 className="vehicle-title">Chevrolet Spark 2020</h3>
                    <p className="vehicle-price">$8,500,000</p>
                    <p className="vehicle-details">Manual • 45,000 km • Gasolina</p>
                    <div className="vehicle-stats">
                      <span className="vehicle-stat">👁️ 89 vistas</span>
                      <span className="vehicle-stat">💬 3 consultas</span>
                    </div>
                    <div className="vehicle-actions">
                      <button className="btn-outline-sm">Editar</button>
                      <button className="btn-outline-sm">Ver</button>
                    </div>
                  </div>
                </div>

                <div className="vehicle-card">
                  <div className="vehicle-image-placeholder">📷</div>
                  <div className="vehicle-info">
                    <h3 className="vehicle-title">Toyota Yaris 2021</h3>
                    <p className="vehicle-price">$12,200,000</p>
                    <p className="vehicle-details">Automático • 25,000 km • Gasolina</p>
                    <div className="vehicle-stats">
                      <span className="vehicle-stat">👁️ 156 vistas</span>
                      <span className="vehicle-stat">💬 7 consultas</span>
                    </div>
                    <div className="vehicle-actions">
                      <button className="btn-outline-sm">Editar</button>
                      <button className="btn-outline-sm">Ver</button>
                    </div>
                  </div>
                </div>

                <div className="vehicle-card">
                  <div className="vehicle-image-placeholder">📷</div>
                  <div className="vehicle-info">
                    <h3 className="vehicle-title">Nissan Versa 2019</h3>
                    <p className="vehicle-price">$9,800,000</p>
                    <p className="vehicle-details">Automático • 60,000 km • Gasolina</p>
                    <div className="vehicle-stats">
                      <span className="vehicle-stat">👁️ 203 vistas</span>
                      <span className="vehicle-stat">💬 5 consultas</span>
                    </div>
                    <div className="vehicle-actions">
                      <button className="btn-outline-sm">Editar</button>
                      <button className="btn-outline-sm">Ver</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && (
          <div>
            <div className="section">
              <h2 className="section-title">Consultas Recibidas</h2>
              
              <div className="inquiries-list">
                <div className="inquiry-item">
                  <div className="inquiry-header">
                    <h3 className="inquiry-customer">Pedro Martínez</h3>
                    <span className="inquiry-time">Hace 2 horas</span>
                  </div>
                  <p className="inquiry-vehicle">Consulta sobre: Chevrolet Spark 2020</p>
                  <p className="inquiry-message">"¿El vehículo está disponible para una prueba de manejo?"</p>
                  <div className="inquiry-contact">
                    <span>📧 pedro.martinez@email.com</span>
                    <span>📱 +56 9 8888 7777</span>
                  </div>
                  <div className="inquiry-actions">
                    <button className="btn-primary-sm">Responder</button>
                    <button className="btn-outline-sm">Marcar como leído</button>
                  </div>
                </div>

                <div className="inquiry-item">
                  <div className="inquiry-header">
                    <h3 className="inquiry-customer">Sofía Herrera</h3>
                    <span className="inquiry-time">Ayer</span>
                  </div>
                  <p className="inquiry-vehicle">Consulta sobre: Toyota Yaris 2021</p>
                  <p className="inquiry-message">"¿Aceptan vehículo en parte de pago?"</p>
                  <div className="inquiry-contact">
                    <span>📧 sofia.herrera@email.com</span>
                    <span>📱 +56 9 6666 5555</span>
                  </div>
                  <div className="inquiry-actions">
                    <button className="btn-primary-sm">Responder</button>
                    <button className="btn-outline-sm">Marcar como leído</button>
                  </div>
                </div>

                <div className="inquiry-item">
                  <div className="inquiry-header">
                    <h3 className="inquiry-customer">Roberto Silva</h3>
                    <span className="inquiry-time">Hace 3 días</span>
                  </div>
                  <p className="inquiry-vehicle">Consulta sobre: Nissan Versa 2019</p>
                  <p className="inquiry-message">"¿Tiene algún problema mecánico? ¿Incluye revisión técnica?"</p>
                  <div className="inquiry-contact">
                    <span>📧 roberto.silva@email.com</span>
                    <span>📱 +56 9 4444 3333</span>
                  </div>
                  <div className="inquiry-actions">
                    <button className="btn-primary-sm">Responder</button>
                    <button className="btn-outline-sm">Marcar como leído</button>
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

export default SellerDashboard;