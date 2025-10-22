import { useAuth } from '../hooks/useAuth';
import ProfileManagerSimple from './ProfileManagerSimple';
import './UserProfile.css';

interface UserProfileProps {
  onBack?: () => void;
}

function UserProfile({ onBack }: UserProfileProps) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      if (onBack) onBack();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  if (!user) {
    return (
      <div className="user-profile">
        <div className="container">
          <div className="error-state">
            <p>❌ Error: Usuario no autenticado</p>
            <button onClick={onBack} className="back-button">
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <button className="back-button" onClick={onBack}>
            ←
          </button>
          <div className="header-content">
            <h1>🏠 Mi Dashboard</h1>
            <p>Gestiona tu información, certificaciones y publicaciones en tiempo real</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>

        {/* Profile Manager Component */}
        <ProfileManagerSimple />
      </div>
    </div>
  );
}

export default UserProfile;
