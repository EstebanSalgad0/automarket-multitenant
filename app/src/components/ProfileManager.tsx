import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import './ProfileManager.css';

interface UserStats {
  totalPosts: number;
  totalViews: number;
  totalContacts: number;
}

interface UserProfileData {
  id: string;
  email: string;
  nombre: string;
  tenant_id: string;
  rol: string;
  tenant_nombre: string;
}

const ProfileManager: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'posts'>('profile');
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    totalViews: 0,
    totalContacts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Estados para edición de perfil
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadUserStats();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user?.email) return;

    try {
      // Primero obtener el usuario básico
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id, email, nombre')
        .eq('email', user.email)
        .single();

      if (usuarioError || !usuarioData) {
        console.error('Error cargando usuario:', usuarioError);
        setMessage({ type: 'error', text: 'Usuario no encontrado en la base de datos' });
        setIsLoading(false);
        return;
      }

      // Obtener información del tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_usuarios')
        .select(`
          tenant_id,
          rol,
          tenants (
            nombre
          )
        `)
        .eq('usuario_id', usuarioData.id)
        .single();

      if (tenantError) {
        console.error('Error cargando tenant:', tenantError);
        // Aún podemos mostrar información básica sin tenant
      }

      setProfileData({
        id: usuarioData.id,
        email: usuarioData.email,
        nombre: usuarioData.nombre,
        tenant_id: tenantData?.tenant_id || '',
        rol: tenantData?.rol || 'sin_rol',
        tenant_nombre: (tenantData?.tenants as any)?.nombre || 'Sin asignar'
      });
      setNewEmail(usuarioData.email);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error cargando perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user?.email) return;

    try {
      // Obtener el ID del usuario primero
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!usuarioData) return;

      // Contar vehículos por tenant del usuario
      const { data: tenantData } = await supabase
        .from('tenant_usuarios')
        .select('tenant_id')
        .eq('usuario_id', usuarioData.id)
        .single();

      if (tenantData) {
        const { count: vehiculosCount } = await supabase
          .from('vehiculos')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantData.tenant_id);

        setStats({
          totalPosts: vehiculosCount || 0,
          totalViews: Math.floor(Math.random() * 1000), // Simulado por ahora
          totalContacts: Math.floor(Math.random() * 50) // Simulado por ahora
        });
      } else {
        setStats({
          totalPosts: 0,
          totalViews: 0,
          totalContacts: 0
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setStats({
        totalPosts: 0,
        totalViews: 0,
        totalContacts: 0
      });
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

  if (isLoading) {
    return <div className="profile-loading">Cargando perfil...</div>;
  }

  if (!profileData) {
    return <div className="profile-error">No se pudo cargar el perfil</div>;
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
                <label>Nombre:</label>
                <span>{profileData.nombre}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{profileData.email}</span>
              </div>
              <div className="info-item">
                <label>Rol:</label>
                <span>{profileData.rol.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="info-item">
                <label>Organización:</label>
                <span>{profileData.tenant_nombre}</span>
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
        <div className="posts-content">
          <div className="posts-header">
            <h3>Mis Publicaciones de Vehículos</h3>
            <button className="add-post-btn">
              + Nueva Publicación
            </button>
          </div>
          
          <div className="posts-summary">
            <p>Total de publicaciones: <strong>{stats.totalPosts}</strong></p>
            <p>Visualizaciones totales: <strong>{stats.totalViews}</strong></p>
            <p>Contactos recibidos: <strong>{stats.totalContacts}</strong></p>
          </div>

          {stats.totalPosts === 0 ? (
            <div className="no-posts">
              <p>Aún no tienes publicaciones de vehículos.</p>
              <button className="create-first-post">
                Crear mi primera publicación
              </button>
            </div>
          ) : (
            <div className="posts-list">
              <p>Lista de publicaciones aparecerá aquí...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileManager;