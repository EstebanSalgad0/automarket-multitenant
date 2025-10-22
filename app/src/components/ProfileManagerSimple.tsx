import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import VehiclePostsDashboard from './VehiclePostsDashboard';
import './ProfileManager.css';

interface UserStats {
  totalPosts: number;
  totalViews: number;
  totalContacts: number;
}

const ProfileManager: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'posts'>('profile');
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    totalViews: 0,
    totalContacts: 0
  });

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Estados para edición de perfil
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setNewEmail(user.email || '');
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Simulamos estadísticas por ahora
      setStats({
        totalPosts: Math.floor(Math.random() * 10),
        totalViews: Math.floor(Math.random() * 1000),
        totalContacts: Math.floor(Math.random() * 50)
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error actualizando contraseña' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || newEmail === user?.email) {
      setMessage({ type: 'error', text: 'Por favor ingresa un email diferente' });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Email actualizado. Revisa tu correo para confirmar el cambio.' 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error actualizando email' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return <div className="profile-loading">Usuario no autenticado</div>;
  }

  return (
    <div className="profile-manager">
      <div className="profile-header">
        <h2>Mi Perfil</h2>
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Perfil
          </button>
          <button 
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Mis Publicaciones
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-info">
            <h3>Información Personal</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Usuario ID:</label>
                <span>{user.id.substring(0, 8)}...</span>
              </div>
              <div className="info-item">
                <label>Registrado:</label>
                <span>{new Date(user.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <h3>Estadísticas</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.totalPosts}</span>
                <span className="stat-label">Publicaciones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalViews}</span>
                <span className="stat-label">Visualizaciones</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalContacts}</span>
                <span className="stat-label">Contactos</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <div className="action-section">
              <h3>Cambiar Contraseña</h3>
              <form onSubmit={handlePasswordChange} className="password-form">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </div>

            <div className="action-section">
              <h3>Cambiar Email</h3>
              <form onSubmit={handleEmailChange} className="email-form">
                <input
                  type="email"
                  placeholder="Nuevo email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Actualizando...' : 'Cambiar Email'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <VehiclePostsDashboard />
      )}
    </div>
  );
};

export default ProfileManager;