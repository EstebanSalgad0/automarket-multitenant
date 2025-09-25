import './DealerRegistration.css'

interface DealerRegistrationProps {
  onBack?: () => void;
}

function DealerRegistration({ onBack }: DealerRegistrationProps) {
  return (
    <div className="dealer-registration">
      <div className="container">
        {/* Header */}
        <div className="registration-header">
          <button className="back-button" onClick={onBack}>
            ←
          </button>
          <div className="header-content">
            <h1>Registro de Concesionario / Automotora</h1>
            <p>Únete a nuestra plataforma y conecta con miles de compradores</p>
          </div>
        </div>

        <div className="registration-content">
          {/* Progress Steps */}
          <div className="progress-steps">
            <div className="step active">
              <div className="step-number">1</div>
              <span>Información básica</span>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <span>Documentación</span>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <span>Verificación</span>
            </div>
          </div>

          {/* Form */}
          <div className="registration-form">
            <div className="form-section">
              <h2>📋 Información de la Empresa</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="companyName">Nombre de la empresa *</label>
                  <input type="text" id="companyName" placeholder="Toyota Centro, Nissan Plaza, etc." />
                </div>
                
                <div className="form-group">
                  <label htmlFor="businessType">Tipo de negocio *</label>
                  <select id="businessType">
                    <option value="">Seleccionar tipo</option>
                    <option value="concesionario">Concesionario oficial</option>
                    <option value="automotora">Automotora independiente</option>
                    <option value="multimarca">Multimarca</option>
                    <option value="seminuevos">Especialista en seminuevos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rut">RUT empresa *</label>
                  <input type="text" id="rut" placeholder="12.345.678-9" />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono principal *</label>
                  <input type="tel" id="phone" placeholder="+56 9 1234 5678" />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email corporativo *</label>
                  <input type="email" id="email" placeholder="contacto@empresa.com" />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Sitio web</label>
                  <input type="url" id="website" placeholder="https://www.empresa.com" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>📍 Ubicación</h2>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="address">Dirección completa *</label>
                  <input type="text" id="address" placeholder="Av. Providencia 1234, Providencia" />
                </div>

                <div className="form-group">
                  <label htmlFor="city">Ciudad *</label>
                  <select id="city">
                    <option value="">Seleccionar ciudad</option>
                    <option value="santiago">Santiago</option>
                    <option value="valparaiso">Valparaíso</option>
                    <option value="concepcion">Concepción</option>
                    <option value="antofagasta">Antofagasta</option>
                    <option value="la-serena">La Serena</option>
                    <option value="temuco">Temuco</option>
                    <option value="rancagua">Rancagua</option>
                    <option value="talca">Talca</option>
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
                    <option value="ohiggins">Región de O'Higgins</option>
                    <option value="maule">Región del Maule</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>👤 Contacto principal</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="contactName">Nombre completo *</label>
                  <input type="text" id="contactName" placeholder="Juan Pérez González" />
                </div>

                <div className="form-group">
                  <label htmlFor="position">Cargo *</label>
                  <input type="text" id="position" placeholder="Gerente General, Jefe de Ventas, etc." />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone">Teléfono directo</label>
                  <input type="tel" id="contactPhone" placeholder="+56 9 8765 4321" />
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">Email personal</label>
                  <input type="email" id="contactEmail" placeholder="juan.perez@empresa.com" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>🚗 Información del inventario</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="vehicleCount">Cantidad aproximada de vehículos</label>
                  <select id="vehicleCount">
                    <option value="">Seleccionar rango</option>
                    <option value="1-10">1 - 10 vehículos</option>
                    <option value="11-50">11 - 50 vehículos</option>
                    <option value="51-100">51 - 100 vehículos</option>
                    <option value="101-500">101 - 500 vehículos</option>
                    <option value="500+">Más de 500 vehículos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="brands">Marcas que maneja</label>
                  <input type="text" id="brands" placeholder="Toyota, Nissan, Hyundai..." />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="specialties">Especialidades (opcional)</label>
                  <textarea id="specialties" rows={3} placeholder="Seminuevos premium, vehículos comerciales, autos eléctricos..."></textarea>
                </div>
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
                  Continuar →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealerRegistration
