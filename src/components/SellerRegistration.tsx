import './SellerRegistration.css'

interface SellerRegistrationProps {
  onBack?: () => void;
}

function SellerRegistration({ onBack }: SellerRegistrationProps) {
  return (
    <div className="seller-registration">
      <div className="container">
        {/* Header */}
        <div className="registration-header">
          <button className="back-button" onClick={onBack}>
            ←
          </button>
          <div className="header-content">
            <h1>Registro de Vendedor Particular</h1>
            <p>Vende tu vehículo de forma fácil, rápida y segura</p>
          </div>
        </div>

        <div className="registration-layout">
          {/* Benefits Sidebar */}
          <div className="benefits-sidebar">
            <h3>✨ Beneficios para ti</h3>
            <div className="benefit-list">
              <div className="benefit-item">
                <div className="benefit-icon">📸</div>
                <div className="benefit-content">
                  <h4>Fotos profesionales</h4>
                  <p>Servicio gratuito para destacar tu vehículo</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <div className="benefit-icon">💰</div>
                <div className="benefit-content">
                  <h4>Valuación gratuita</h4>
                  <p>Conoce el precio real de mercado</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <div className="benefit-icon">🛡️</div>
                <div className="benefit-content">
                  <h4>Transacciones seguras</h4>
                  <p>Verificación de compradores</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <div className="benefit-icon">📈</div>
                <div className="benefit-content">
                  <h4>Máxima exposición</h4>
                  <p>Miles de compradores potenciales</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <div className="benefit-icon">💬</div>
                <div className="benefit-content">
                  <h4>Chat directo</h4>
                  <p>Comunicación directa con interesados</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <div className="benefit-icon">🎯</div>
                <div className="benefit-content">
                  <h4>Herramientas de promoción</h4>
                  <p>Destacar tu publicación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="registration-form">
            <div className="form-section">
              <h2>👤 Información personal</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">Nombres *</label>
                  <input type="text" id="firstName" placeholder="Juan Carlos" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Apellidos *</label>
                  <input type="text" id="lastName" placeholder="Pérez González" />
                </div>

                <div className="form-group">
                  <label htmlFor="rut">RUT *</label>
                  <input type="text" id="rut" placeholder="12.345.678-9" />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono *</label>
                  <input type="tel" id="phone" placeholder="+56 9 1234 5678" />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" placeholder="tu.email@ejemplo.com" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>📍 Ubicación</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="city">Ciudad *</label>
                  <select id="city">
                    <option value="">Seleccionar ciudad</option>
                    <option value="santiago">Santiago</option>
                    <option value="las-condes">Las Condes</option>
                    <option value="providencia">Providencia</option>
                    <option value="vitacura">Vitacura</option>
                    <option value="nunoa">Ñuñoa</option>
                    <option value="maipu">Maipú</option>
                    <option value="valparaiso">Valparaíso</option>
                    <option value="vina-del-mar">Viña del Mar</option>
                    <option value="concepcion">Concepción</option>
                    <option value="antofagasta">Antofagasta</option>
                    <option value="la-serena">La Serena</option>
                    <option value="temuco">Temuco</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="region">Región *</label>
                  <select id="region">
                    <option value="">Seleccionar región</option>
                    <option value="metropolitana">Región Metropolitana</option>
                    <option value="valparaiso">Región de Valparaíso</option>
                    <option value="biobio">Región del Biobío</option>
                    <option value="antofagasta">Región de Antofagasta</option>
                    <option value="coquimbo">Región de Coquimbo</option>
                    <option value="araucania">Región de La Araucanía</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>🚗 Información del vehículo a vender</h2>
              <p className="section-description">Puedes agregar más vehículos después del registro</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="vehicleBrand">Marca *</label>
                  <select id="vehicleBrand">
                    <option value="">Seleccionar marca</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="nissan">Nissan</option>
                    <option value="volkswagen">Volkswagen</option>
                    <option value="ford">Ford</option>
                    <option value="chevrolet">Chevrolet</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="kia">Kia</option>
                    <option value="mazda">Mazda</option>
                    <option value="bmw">BMW</option>
                    <option value="mercedes">Mercedes-Benz</option>
                    <option value="audi">Audi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="vehicleModel">Modelo *</label>
                  <input type="text" id="vehicleModel" placeholder="Corolla, Civic, etc." />
                </div>

                <div className="form-group">
                  <label htmlFor="vehicleYear">Año *</label>
                  <select id="vehicleYear">
                    <option value="">Seleccionar año</option>
                    {Array.from({length: 30}, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="vehicleKm">Kilometraje *</label>
                  <input type="number" id="vehicleKm" placeholder="50000" />
                </div>

                <div className="form-group">
                  <label htmlFor="vehiclePrice">Precio esperado (CLP)</label>
                  <input type="text" id="vehiclePrice" placeholder="15.000.000" />
                </div>

                <div className="form-group">
                  <label htmlFor="vehicleCondition">Estado del vehículo *</label>
                  <select id="vehicleCondition">
                    <option value="">Seleccionar estado</option>
                    <option value="excelente">Excelente</option>
                    <option value="muy-bueno">Muy bueno</option>
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                    <option value="necesita-reparacion">Necesita reparación</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>📋 Preferencias de contacto</h2>
              
              <div className="contact-preferences">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  Recibir notificaciones por email
                </label>
                
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  Permitir llamadas telefónicas
                </label>
                
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  Recibir mensajes de WhatsApp
                </label>
                
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Recibir ofertas y promociones
                </label>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="form-actions">
              <div className="terms-section">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Acepto los <a href="#" className="link">términos y condiciones</a> y la <a href="#" className="link">política de privacidad</a>
                </label>
              </div>

              <div className="submit-section">
                <button type="button" className="btn-secondary" onClick={onBack}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear cuenta →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerRegistration
