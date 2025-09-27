import { useState, useEffect } from 'react'
import './App.css'
import UserProfile from './components/UserProfile'
import DealerRegistration from './components/DealerRegistration'
import SellerRegistration from './components/SellerRegistration'
import VehiclesCatalog from './components/VehiclesCatalog'
import { testSupabaseConnection, testSupabaseAuth } from './utils/testSupabase'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'dealer-registration' | 'seller-registration' | 'vehicles-catalog'>('home')
  const [searchFilters, setSearchFilters] = useState<any>({})
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [homeSearchData, setHomeSearchData] = useState({
    type: '',
    brand: '',
    maxPrice: '',
    location: ''
  })
  const [supabaseStatus, setSupabaseStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  // Probar conexión con Supabase al cargar
  useEffect(() => {
    const runTests = async () => {
      console.log('🚀 Iniciando pruebas de Supabase...');
      
      try {
        // Test de conexión
        const connectionTest = await testSupabaseConnection();
        const authTest = await testSupabaseAuth();
        
        if (connectionTest.success && authTest.success) {
          setSupabaseStatus('connected');
          console.log('✅ Todos los tests pasaron correctamente');
        } else {
          setSupabaseStatus('error');
          console.error('❌ Algunos tests fallaron');
        }
      } catch (error) {
        console.error('❌ Error ejecutando tests:', error);
        setSupabaseStatus('error');
      }
    };

    runTests();
  }, [])

  if (currentView === 'profile') {
    return <UserProfile onBack={() => setCurrentView('home')} />
  }

  if (currentView === 'dealer-registration') {
    return <DealerRegistration onBack={() => setCurrentView('home')} />
  }

  if (currentView === 'seller-registration') {
    return <SellerRegistration onBack={() => setCurrentView('home')} />
  }

  if (currentView === 'vehicles-catalog') {
    return <VehiclesCatalog onBack={() => setCurrentView('home')} initialFilters={searchFilters} />
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav-brand">
            <div className="logo">
              <span className="logo-icon">🚗</span>
              <span className="logo-text">AutoMarket</span>
            </div>
          </div>
          
          <nav className="nav-menu">
            <button className="nav-link" onClick={() => setCurrentView('vehicles-catalog')}>Comprar</button>
            <button className="nav-link" onClick={() => {}}>Vender</button>
            <button className="nav-link" onClick={() => {}}>Financiamiento</button>
            <button className="nav-link" onClick={() => {}}>Ayuda</button>
          </nav>
          
          <div className="nav-actions">
            <button className="btn-icon">❤️</button>
            <button className="btn-icon">🔔</button>
            <button className="btn-icon" onClick={() => setCurrentView('profile')}>👤</button>
            <span className="nav-link">Iniciar sesión</span>
            <button className="btn-primary">Publicar vehículo</button>
            {/* Indicador de estado de Supabase */}
            <div className={`supabase-indicator ${supabaseStatus}`}>
              {supabaseStatus === 'connecting' && '🔄'}
              {supabaseStatus === 'connected' && '✅'}
              {supabaseStatus === 'error' && '❌'}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Encuentra tu <span className="text-highlight">vehículo ideal</span>
          </h1>
          <p className="hero-subtitle">
            Miles de vehículos de concesionarios y particulares al mejor precio
          </p>
          
          <div className="search-form">
            <select 
              className="search-select"
              value={homeSearchData.type}
              onChange={(e) => setHomeSearchData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Tipo de vehículo</option>
              <option value="Sedán">Sedán</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Pickup">Pickup</option>
              <option value="Convertible">Convertible</option>
            </select>
            
            <select 
              className="search-select"
              value={homeSearchData.brand}
              onChange={(e) => setHomeSearchData(prev => ({ ...prev, brand: e.target.value }))}
            >
              <option value="">Marca</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Nissan">Nissan</option>
              <option value="Mazda">Mazda</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Chevrolet">Chevrolet</option>
              <option value="harley">Harley-Davidson</option>
              <option value="ducati">Ducati</option>
            </select>
            
            <input 
              type="text" 
              className="search-select price-input" 
              placeholder="Precio máximo (CLP)"
              value={homeSearchData.maxPrice}
              onChange={(e) => {
                // Format number with dots
                let value = e.target.value.replace(/\D/g, '');
                if (value) {
                  value = parseInt(value).toLocaleString('es-CL');
                }
                setHomeSearchData(prev => ({ ...prev, maxPrice: value }));
              }}
            />
            
            <select 
              className="search-select"
              value={homeSearchData.location}
              onChange={(e) => setHomeSearchData(prev => ({ ...prev, location: e.target.value }))}
            >
              <option value="">Ciudad</option>
              <option value="Santiago">Santiago</option>
              <option value="Las Condes">Las Condes</option>
              <option value="Providencia">Providencia</option>
              <option value="Ñuñoa">Ñuñoa</option>
              <option value="Maipú">Maipú</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Viña del Mar">Viña del Mar</option>
            </select>
            
            <button 
              className="btn-search"
              onClick={() => {
                setSearchFilters(homeSearchData);
                setShowSearchResults(true);
              }}
            >
              🔍 Buscar vehículos
            </button>
          </div>
          
          <div className="stats">
            <div className="stat">
              <h3>15,000+</h3>
              <p>Vehículos disponibles</p>
            </div>
            <div className="stat">
              <h3>500+</h3>
              <p>Concesionarios</p>
            </div>
            <div className="stat">
              <h3>25,000+</h3>
              <p>Usuarios satisfechos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {showSearchResults && (
        <section className="search-results">
          <div className="container">
            <h2>Resultados de búsqueda</h2>
            <p>Mostrando los primeros 3 resultados</p>
            
            <div className="results-grid">
              <div className="vehicle-card-home">
                <div className="vehicle-image">
                  <img src="/api/placeholder/300/200" alt="Toyota Corolla" />
                  <div className="seller-badge">🏢 Concesionario</div>
                </div>
                <div className="vehicle-info">
                  <h3>Toyota Corolla GLi 1.8</h3>
                  <div className="vehicle-price">$18.500.000</div>
                  <div className="vehicle-details">
                    <span>2022</span>
                    <span>15.000 km</span>
                    <span>Automática</span>
                  </div>
                  <div className="vehicle-seller">
                    <strong>Toyota Centro</strong>
                    <span>Santiago Centro</span>
                  </div>
                </div>
              </div>

              <div className="vehicle-card-home">
                <div className="vehicle-image">
                  <img src="/api/placeholder/300/200" alt="Honda Civic" />
                  <div className="seller-badge">🏢 Concesionario</div>
                </div>
                <div className="vehicle-info">
                  <h3>Honda Civic Sport 2.0</h3>
                  <div className="vehicle-price">$22.900.000</div>
                  <div className="vehicle-details">
                    <span>2023</span>
                    <span>8.500 km</span>
                    <span>Manual</span>
                  </div>
                  <div className="vehicle-seller">
                    <strong>Honda Premium</strong>
                    <span>Las Condes</span>
                  </div>
                </div>
              </div>

              <div className="vehicle-card-home">
                <div className="vehicle-image">
                  <img src="/api/placeholder/300/200" alt="Mazda CX-5" />
                  <div className="seller-badge">👤 Particular</div>
                </div>
                <div className="vehicle-info">
                  <h3>Mazda CX-5 AWD</h3>
                  <div className="vehicle-price">$28.750.000</div>
                  <div className="vehicle-details">
                    <span>2023</span>
                    <span>12.000 km</span>
                    <span>Automática</span>
                  </div>
                  <div className="vehicle-seller">
                    <strong>Carlos González</strong>
                    <span>Providencia</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="view-all-section">
              <button 
                className="btn-view-all"
                onClick={() => {
                  setCurrentView('vehicles-catalog');
                  setShowSearchResults(false);
                }}
              >
                Ver todos los vehículos
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2>Explora por categorías</h2>
          <p>Encuentra exactamente lo que buscas</p>
          
          <div className="category-grid">
            <div className="category-card">
              <div className="category-icon blue">🚗</div>
              <h3>Automóviles</h3>
              <p className="category-count">12,500+</p>
              <small>Sedanes, SUVs, hatchbacks y más</small>
            </div>
            <div className="category-card">
              <div className="category-icon green">🏍️</div>
              <h3>Motocicletas</h3>
              <p className="category-count">2,100+</p>
              <small>Deportivas, urbanas y scooters</small>
            </div>
            <div className="category-card">
              <div className="category-icon orange">🚛</div>
              <h3>Camiones</h3>
              <p className="category-count">800+</p>
              <small>Pickup, carga y comerciales</small>
            </div>
            <div className="category-card">
              <div className="category-icon purple">⚡</div>
              <h3>Eléctricos</h3>
              <p className="category-count">350+</p>
              <small>Vehículos ecológicos</small>
            </div>
          </div>
          
          <div className="verification-badges">
            <div className="badge">
              <span className="badge-icon">✓</span>
              <div>
                <h4>Vehículos verificados</h4>
                <p>Historial y documentación completa</p>
              </div>
            </div>
            <div className="badge">
              <span className="badge-icon">⭐</span>
              <div>
                <h4>Vendedores certificados</h4>
                <p>Concesionarios y particulares verificados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="featured">
        <div className="container">
          <h2>Vehículos destacados</h2>
          <p>Los mejores vehículos de concesionarios y particulares verificados</p>
          
          <div className="carousel-container">
            <button className="carousel-btn prev" onClick={() => {
              const carousel = document.querySelector('.vehicles-carousel');
              carousel?.scrollBy({ left: -400, behavior: 'smooth' });
            }}>
              ‹
            </button>
            
            <div className="vehicles-carousel">
              <div className="vehicle-card">
                <div className="vehicle-badge featured">Destacado</div>
                <div className="vehicle-image">
                  <img src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Toyota Camry" />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-tags">
                    <span className="tag dealer">Concesionario</span>
                    <span className="dealer-name">Toyota Centro</span>
                  </div>
                  <h3>Toyota Camry 2022</h3>
                  <p className="price">$28,500</p>
                  <div className="vehicle-details">
                    <span>📅 2022</span>
                    <span>🛣️ 15,000 km</span>
                    <span>⛽ Gasolina</span>
                    <span>📍 Ciudad de México</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">👁️ Ver detalles</button>
                    <button className="btn-outline">Contactar</button>
                  </div>
                </div>
              </div>
              
              <div className="vehicle-card">
                <div className="vehicle-image">
                  <img src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Honda Civic" />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-tags">
                    <span className="tag individual">Particular</span>
                    <span className="dealer-name">Carlos M.</span>
                  </div>
                  <h3>Honda Civic 2021</h3>
                  <p className="price">$24,900</p>
                  <div className="vehicle-details">
                    <span>📅 2021</span>
                    <span>🛣️ 28,000 km</span>
                    <span>⛽ Gasolina</span>
                    <span>📍 Guadalajara</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">👁️ Ver detalles</button>
                    <button className="btn-outline">Contactar</button>
                  </div>
                </div>
              </div>
              
              <div className="vehicle-card">
                <div className="vehicle-badge featured">Destacado</div>
                <div className="vehicle-image">
                  <img src="https://images.unsplash.com/photo-1566473965997-3de9c817e938?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Volkswagen Jetta" />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-tags">
                    <span className="tag dealer">Concesionario</span>
                    <span className="dealer-name">VW Monterrey</span>
                  </div>
                  <h3>Volkswagen Jetta 2023</h3>
                  <p className="price">$32,000</p>
                  <div className="vehicle-details">
                    <span>📅 2023</span>
                    <span>🛣️ 8,500 km</span>
                    <span>⛽ Gasolina</span>
                    <span>📍 Monterrey</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">👁️ Ver detalles</button>
                    <button className="btn-outline">Contactar</button>
                  </div>
                </div>
              </div>

              <div className="vehicle-card">
                <div className="vehicle-badge offer">En Oferta</div>
                <div className="vehicle-image">
                  <img src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Ford Focus" />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-tags">
                    <span className="tag dealer">Concesionario</span>
                    <span className="dealer-name">Ford Plaza</span>
                  </div>
                  <h3>Ford Focus 2020</h3>
                  <p className="price">$22,500 <span className="old-price">$26,000</span></p>
                  <div className="vehicle-details">
                    <span>📅 2020</span>
                    <span>🛣️ 35,000 km</span>
                    <span>⛽ Gasolina</span>
                    <span>📍 Puebla</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">👁️ Ver detalles</button>
                    <button className="btn-outline">Contactar</button>
                  </div>
                </div>
              </div>

              <div className="vehicle-card">
                <div className="vehicle-badge featured">Destacado</div>
                <div className="vehicle-image">
                  <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Mazda CX-5" />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-tags">
                    <span className="tag individual">Particular</span>
                    <span className="dealer-name">Ana L.</span>
                  </div>
                  <h3>Mazda CX-5 2022</h3>
                  <p className="price">$35,800</p>
                  <div className="vehicle-details">
                    <span>📅 2022</span>
                    <span>🛣️ 18,500 km</span>
                    <span>⛽ Gasolina</span>
                    <span>📍 Tijuana</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">👁️ Ver detalles</button>
                    <button className="btn-outline">Contactar</button>
                  </div>
                </div>
              </div>

              <div className="vehicle-card">
                <div className="vehicle-badge offer">En Oferta</div>
                <div className="vehicle-image">
                  <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Chevrolet Cruze" />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-tags">
                    <span className="tag dealer">Concesionario</span>
                    <span className="dealer-name">Chevrolet Sur</span>
                  </div>
                  <h3>Chevrolet Cruze 2021</h3>
                  <p className="price">$27,200 <span className="old-price">$30,000</span></p>
                  <div className="vehicle-details">
                    <span>📅 2021</span>
                    <span>🛣️ 22,000 km</span>
                    <span>⛽ Gasolina</span>
                    <span>📍 Querétaro</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">👁️ Ver detalles</button>
                    <button className="btn-outline">Contactar</button>
                  </div>
                </div>
              </div>

              <div className="vehicle-card">
                <div className="vehicle-badge featured">Destacado</div>
                <div className="vehicle-image">
                  <img src="https://images.unsplash.com/photo-1620713739280-dfb0f6ee2226?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Hyundai Elantra" />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-tags">
                    <span className="tag individual">Particular</span>
                    <span className="dealer-name">Miguel R.</span>
                  </div>
                  <h3>Hyundai Elantra 2023</h3>
                  <p className="price">$29,900</p>
                  <div className="vehicle-details">
                    <span>📅 2023</span>
                    <span>🛣️ 12,000 km</span>
                    <span>⛽ Gasolina</span>
                    <span>📍 León</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">👁️ Ver detalles</button>
                    <button className="btn-outline">Contactar</button>
                  </div>
                </div>
              </div>

              <div className="vehicle-card">
                <div className="vehicle-badge offer">En Oferta</div>
                <div className="vehicle-image">
                  <img src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Kia Forte" />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-tags">
                    <span className="tag dealer">Concesionario</span>
                    <span className="dealer-name">Kia Motors</span>
                  </div>
                  <h3>Kia Forte 2020</h3>
                  <p className="price">$21,800 <span className="old-price">$24,500</span></p>
                  <div className="vehicle-details">
                    <span>📅 2020</span>
                    <span>🛣️ 42,000 km</span>
                    <span>⛽ Gasolina</span>
                    <span>📍 Mérida</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-secondary">👁️ Ver detalles</button>
                    <button className="btn-outline">Contactar</button>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="carousel-btn next" onClick={() => {
              const carousel = document.querySelector('.vehicles-carousel');
              carousel?.scrollBy({ left: 400, behavior: 'smooth' });
            }}>
              ›
            </button>
          </div>
          
          <div className="carousel-indicators">
            <span className="indicator active"></span>
            <span className="indicator"></span>
            <span className="indicator"></span>
          </div>
        </div>
      </section>

      {/* Seller Plans */}
      <section className="seller-plans">
        <div className="container">
          <h2>¿Quieres <span className="text-highlight">vender</span> tu vehículo?</h2>
          <p>Elige el plan que mejor se adapte a tus necesidades</p>
          
          <div className="plans-grid">
            <div className="plan-card">
              <div className="plan-icon">📋</div>
              <h3>Concesionario / Automotora</h3>
              <p>Para empresas que venden múltiples vehículos</p>
              <ul className="plan-features">
                <li>• Dashboard empresarial</li>
                <li>• Gestión de inventario</li>
                <li>• Estadísticas de ventas</li>
                <li>• Soporte prioritario</li>
                <li>• Sin límite de publicaciones</li>
              </ul>
              <button 
                className="btn-primary"
                onClick={() => setCurrentView('dealer-registration')}
              >
                Registrar empresa
              </button>
            </div>
            
            <div className="plan-card">
              <div className="plan-icon">👤</div>
              <h3>Vendedor particular</h3>
              <p>Para personas que venden su vehículo personal</p>
              <ul className="plan-features">
                <li>• Publicación fácil y rápida</li>
                <li>• Hasta 3 vehículos</li>
                <li>• Herramientas de promoción</li>
                <li>• Chat directo con compradores</li>
                <li>• Valuación gratuita</li>
              </ul>
              <button 
                className="btn-outline"
                onClick={() => setCurrentView('seller-registration')}
              >
                Vender mi auto
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits">
        <div className="benefits-bg">
          <div className="container">
            <div className="benefits-header">
              <h2>Beneficios de vender con nosotros</h2>
              <p>Maximiza el valor de tu vehículo con nuestros servicios profesionales</p>
            </div>
            
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <div className="benefit-icon">📸</div>
                </div>
                <div className="benefit-content">
                  <h3>Fotos profesionales</h3>
                  <p>Servicio de fotografía para destacar tu vehículo y atraer más compradores interesados</p>
                </div>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <div className="benefit-icon">💰</div>
                </div>
                <div className="benefit-content">
                  <h3>Valuación gratuita</h3>
                  <p>Conoce el precio real de tu vehículo en el mercado actual con nuestros expertos</p>
                </div>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <div className="benefit-icon">🛡️</div>
                </div>
                <div className="benefit-content">
                  <h3>Transacciones seguras</h3>
                  <p>Verificación de compradores y documentación legal para transacciones 100% seguras</p>
                </div>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <div className="benefit-icon">📈</div>
                </div>
                <div className="benefit-content">
                  <h3>Máxima exposición</h3>
                  <p>Tu vehículo visto por miles de compradores potenciales en toda la plataforma</p>
                </div>
              </div>
            </div>
            
            <div className="benefits-cta">
              <button 
                className="btn-primary-large"
                onClick={() => setCurrentView('seller-registration')}
              >
                Vender mi vehículo ahora
              </button>
              <p className="cta-note">✅ Sin costos ocultos • ✅ Publicación gratuita • ✅ Soporte 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">🚗</span>
                <span className="logo-text">AutoMarket</span>
              </div>
              <p>La plataforma líder en venta de vehículos que conecta compradores con concesionarios y particulares verificados en todo el país.</p>
              <div className="social-links">
                <a href="#">📘</a>
                <a href="#">🐦</a>
                <a href="#">📷</a>
                <a href="#">📺</a>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Comprar</h4>
                <a href="#">Automóviles</a>
                <a href="#">Motocicletas</a>
                <a href="#">Camiones</a>
                <a href="#">Vehículos eléctricos</a>
                <a href="#">Seminuevos</a>
              </div>
              
              <div className="footer-column">
                <h4>Vender</h4>
                <a href="#">Vender mi auto</a>
                <a href="#">Para concesionarios</a>
                <a href="#">Valuación gratuita</a>
                <a href="#">Consejos de venta</a>
                <a href="#">Documentación</a>
              </div>
              
              <div className="footer-column">
                <h4>Contacto</h4>
                <p>📞 +52 800 123 4567</p>
                <p>✉️ contacto@automarket.com</p>
              </div>
              
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#">Términos y condiciones</a>
                <a href="#">Política de privacidad</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
