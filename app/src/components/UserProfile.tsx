import './UserProfile.css'

interface UserProfileProps {
  onBack?: () => void;
}

function UserProfile({ onBack }: UserProfileProps) {
  return (
    <div className="user-profile">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <button className="back-button" onClick={onBack}>
            ←
          </button>
          <div className="header-content">
            <h1>Mi Perfil</h1>
            <p>Gestiona tu información y certificaciones</p>
          </div>
        </div>

        <div className="profile-content">
          {/* Left Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  <span>JP</span>
                </div>
                <div className="verified-badge">
                  <span>✓</span>
                </div>
              </div>
              
              <div className="profile-info">
                <h2>Juan Pérez</h2>
                <p className="email">juan.perez@email.com</p>
                <p className="location">📍 Santiago, Chile</p>
              </div>
            </div>

            {/* User Type Selection */}
            <div className="user-type-section">
              <div className="section-header">
                <span className="crown-icon">👑</span>
                <span>Tipo de Usuario</span>
              </div>
              
              <div className="user-type-options">
                <button className="user-type-btn active">
                  <span className="type-icon">👤</span>
                  Comprador
                </button>
                <button className="user-type-btn">
                  <span className="type-icon">🚗</span>
                  Vendedor Particular
                </button>
                <button className="user-type-btn">
                  <span className="type-icon">🏢</span>
                  Concesionario
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="rating-section">
              <div className="rating-header">
                <span className="star-icon">⭐</span>
                <span>Calificación</span>
              </div>
              
              <div className="rating-content">
                <div className="rating-stars">
                  <span className="stars">⭐⭐⭐⭐☆</span>
                  <span className="rating-number">4.2</span>
                  <span className="rating-total">/5</span>
                </div>
                <p className="rating-reviews">Basado en 127 reseñas</p>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
              <div className="stat-item">
                <h3>15</h3>
                <p>Transacciones</p>
              </div>
              <div className="stat-item">
                <h3>3</h3>
                <p>Años activo</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {/* Navigation Tabs */}
            <div className="profile-tabs">
              <button className="tab-btn active">
                <span className="tab-icon">🛡️</span>
                Certificaciones
              </button>
              <button className="tab-btn">
                <span className="tab-icon">🚗</span>
                Mis Vehículos
              </button>
              <button className="tab-btn">
                <span className="tab-icon">📊</span>
                Historial
              </button>
            </div>

            {/* Certifications Content */}
            <div className="certifications-section">
              <div className="section-intro">
                <div className="intro-icon">🛡️</div>
                <div className="intro-text">
                  <h3>Certificaciones de Confianza</h3>
                  <p>Sube tus certificados para aumentar la confianza de otros usuarios</p>
                </div>
              </div>

              <div className="certifications-list">
                {/* Certificate 1 */}
                <div className="certificate-item">
                  <div className="cert-icon verified">
                    <span>✓</span>
                  </div>
                  <div className="cert-info">
                    <h4>Certificado de Antecedentes</h4>
                    <p className="cert-status verified">Verificado • 2024-01-15</p>
                  </div>
                  <button className="cert-action verified">
                    ✓ Verificado
                  </button>
                </div>

                {/* Certificate 2 */}
                <div className="certificate-item">
                  <div className="cert-icon pending">
                    <span>📄</span>
                  </div>
                  <div className="cert-info">
                    <h4>Certificado de Ingresos</h4>
                    <p className="cert-status pending">Pendiente de verificación • 2024-01-20</p>
                  </div>
                  <button className="cert-action pending">
                    ⏳ Pendiente
                  </button>
                </div>

                {/* Certificate 3 */}
                <div className="certificate-item">
                  <div className="cert-icon verified">
                    <span>✓</span>
                  </div>
                  <div className="cert-info">
                    <h4>Licencia de Conducir</h4>
                    <p className="cert-status verified">Verificado • 2024-01-10</p>
                  </div>
                  <button className="cert-action verified">
                    ✓ Verificado
                  </button>
                </div>
              </div>

              {/* Upload New Certificate */}
              <button className="upload-certificate-btn">
                <span className="upload-icon">📤</span>
                Subir Nuevo Certificado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
