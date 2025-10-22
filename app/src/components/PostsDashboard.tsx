import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import './PostsDashboard.css'

interface VehiclePost {
  id: string
  title: string
  description: string
  status: 'active' | 'sold' | 'inactive'
  views_count: number
  contacts_count: number
  featured: boolean
  published_at: string
  expires_at: string | null
  vehicle: {
    id: string
    brand: string
    model: string
    year: number
    price: number
    mileage: number
    fuel_type: string
    transmission: string
    color: string
    images: string[]
  }
}

interface PostsDashboardProps {
  user: User
}

export const PostsDashboard: React.FC<PostsDashboardProps> = ({ user }) => {
  const [posts, setPosts] = useState<VehiclePost[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Estados para el formulario de creación
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    vehicleId: '',
    featured: false,
    expiresAt: ''
  })

  // Estados para filtros
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'contacts'>('newest')

  useEffect(() => {
    loadPosts()
    
    // Configurar suscripción en tiempo real
    const subscription = supabase
      .channel('posts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vehicle_posts',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Cambio en publicaciones:', payload)
          loadPosts() // Recargar posts cuando hay cambios
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_posts')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .eq('user_id', user.id)
        .order('published_at', { ascending: false })

      if (error) throw error

      setPosts(data || [])
    } catch (err) {
      console.error('Error cargando publicaciones:', err)
      setError('Error cargando las publicaciones')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async () => {
    if (!newPost.title || !newPost.vehicleId) {
      setError('Título y vehículo son obligatorios')
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Obtener información del usuario para el tenant_id
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!userProfile) throw new Error('Usuario no encontrado')

      const postData = {
        title: newPost.title,
        description: newPost.description,
        vehicle_id: newPost.vehicleId,
        user_id: user.id,
        tenant_id: userProfile.tenant_id,
        featured: newPost.featured,
        expires_at: newPost.expiresAt ? new Date(newPost.expiresAt).toISOString() : null
      }

      const { error } = await supabase
        .from('vehicle_posts')
        .insert([postData])

      if (error) throw error

      setSuccess('✅ Publicación creada exitosamente')
      setShowCreateForm(false)
      setNewPost({
        title: '',
        description: '',
        vehicleId: '',
        featured: false,
        expiresAt: ''
      })
      
      loadPosts() // Recargar la lista

      setTimeout(() => setSuccess(null), 3000)

    } catch (err: any) {
      console.error('Error creando publicación:', err)
      setError('Error creando la publicación: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const updatePostStatus = async (postId: string, newStatus: 'active' | 'sold' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('vehicle_posts')
        .update({ status: newStatus })
        .eq('id', postId)

      if (error) throw error

      setSuccess(`✅ Estado actualizado a ${newStatus}`)
      loadPosts()

      setTimeout(() => setSuccess(null), 3000)

    } catch (err: any) {
      setError('Error actualizando estado: ' + err.message)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('vehicle_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      setSuccess('✅ Publicación eliminada')
      loadPosts()

      setTimeout(() => setSuccess(null), 3000)

    } catch (err: any) {
      setError('Error eliminando publicación: ' + err.message)
    }
  }

  const incrementViews = async (postId: string) => {
    try {
      // Obtener el post actual
      const { data: currentPost } = await supabase
        .from('vehicle_posts')
        .select('views_count')
        .eq('id', postId)
        .single()

      if (currentPost) {
        const { error } = await supabase
          .from('vehicle_posts')
          .update({ 
            views_count: (currentPost.views_count || 0) + 1 
          })
          .eq('id', postId)

        if (error) throw error
      }
      
      loadPosts()
    } catch (err) {
      console.error('Error incrementando vistas:', err)
    }
  }

  const incrementContacts = async (postId: string) => {
    try {
      // Obtener el post actual
      const { data: currentPost } = await supabase
        .from('vehicle_posts')
        .select('contacts_count')
        .eq('id', postId)
        .single()

      if (currentPost) {
        const { error } = await supabase
          .from('vehicle_posts')
          .update({ 
            contacts_count: (currentPost.contacts_count || 0) + 1 
          })
          .eq('id', postId)

        if (error) throw error
      }
      
      loadPosts()
    } catch (err) {
      console.error('Error incrementando contactos:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: '🟢 Activo', class: 'status-active' },
      sold: { text: '✅ Vendido', class: 'status-sold' },
      inactive: { text: '⏸️ Inactivo', class: 'status-inactive' }
    }
    return badges[status as keyof typeof badges] || badges.active
  }

  const filteredAndSortedPosts = posts
    .filter(post => filter === 'all' || post.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        case 'oldest':
          return new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
        case 'views':
          return b.views_count - a.views_count
        case 'contacts':
          return b.contacts_count - a.contacts_count
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="posts-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Cargando publicaciones...</p>
      </div>
    )
  }

  return (
    <div className="posts-dashboard">
      <div className="dashboard-header">
        <h2>📢 Mis Publicaciones</h2>
        <button 
          className="btn-create-post"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ Nueva Publicación
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Estadísticas Rápidas */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-number">{posts.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{posts.filter(p => p.status === 'active').length}</span>
          <span className="stat-label">Activas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{posts.filter(p => p.status === 'sold').length}</span>
          <span className="stat-label">Vendidas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{posts.reduce((sum, p) => sum + p.views_count, 0)}</span>
          <span className="stat-label">Vistas Totales</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{posts.reduce((sum, p) => sum + p.contacts_count, 0)}</span>
          <span className="stat-label">Contactos</span>
        </div>
      </div>

      {/* Filtros y Ordenamiento */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Filtrar por:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="sold">Vendidas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Ordenar por:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="newest">Más Recientes</option>
            <option value="oldest">Más Antiguas</option>
            <option value="views">Más Vistas</option>
            <option value="contacts">Más Contactos</option>
          </select>
        </div>
      </div>

      {/* Lista de Publicaciones */}
      <div className="posts-grid">
        {filteredAndSortedPosts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <h3 className="post-title">{post.title}</h3>
              <div className="post-status">
                <span className={`status-badge ${getStatusBadge(post.status).class}`}>
                  {getStatusBadge(post.status).text}
                </span>
                {post.featured && <span className="featured-badge">⭐ Destacado</span>}
              </div>
            </div>

            <div className="post-vehicle-info">
              <h4>{post.vehicle.brand} {post.vehicle.model} {post.vehicle.year}</h4>
              <p className="vehicle-price">{formatCurrency(post.vehicle.price)}</p>
              <div className="vehicle-details">
                <span>🏃‍♂️ {post.vehicle.mileage?.toLocaleString() || 'N/A'} km</span>
                <span>⛽ {post.vehicle.fuel_type || 'N/A'}</span>
                <span>⚙️ {post.vehicle.transmission || 'N/A'}</span>
                <span>🎨 {post.vehicle.color || 'N/A'}</span>
              </div>
            </div>

            <div className="post-stats">
              <div className="stat">
                <span className="stat-icon">👁️</span>
                <span>{post.views_count}</span>
                <button 
                  className="btn-increment"
                  onClick={() => incrementViews(post.id)}
                  title="Simular vista"
                >
                  +1
                </button>
              </div>
              <div className="stat">
                <span className="stat-icon">📞</span>
                <span>{post.contacts_count}</span>
                <button 
                  className="btn-increment"
                  onClick={() => incrementContacts(post.id)}
                  title="Simular contacto"
                >
                  +1
                </button>
              </div>
            </div>

            <div className="post-meta">
              <p className="publish-date">📅 {formatDate(post.published_at)}</p>
              {post.expires_at && (
                <p className="expires-date">⏰ Expira: {formatDate(post.expires_at)}</p>
              )}
            </div>

            <div className="post-actions">
              <select
                value={post.status}
                onChange={(e) => updatePostStatus(post.id, e.target.value as any)}
                className="status-select"
              >
                <option value="active">🟢 Activo</option>
                <option value="sold">✅ Vendido</option>
                <option value="inactive">⏸️ Inactivo</option>
              </select>
              <button 
                className="btn-delete"
                onClick={() => deletePost(post.id)}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedPosts.length === 0 && (
        <div className="empty-state">
          <p>📭 No hay publicaciones que mostrar</p>
          <button 
            className="btn-create-post"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Crear Primera Publicación
          </button>
        </div>
      )}

      {/* Modal de Creación */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>➕ Nueva Publicación</h3>
              <button 
                className="btn-close"
                onClick={() => setShowCreateForm(false)}
              >
                ❌
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="Ej: Toyota Corolla 2023 - ¡Excelente Oportunidad!"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                  placeholder="Describe las características y condiciones del vehículo..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newPost.featured}
                    onChange={(e) => setNewPost({...newPost, featured: e.target.checked})}
                  />
                  Publicación Destacada
                </label>
              </div>
              <div className="form-group">
                <label>Fecha de Expiración (Opcional)</label>
                <input
                  type="datetime-local"
                  value={newPost.expiresAt}
                  onChange={(e) => setNewPost({...newPost, expiresAt: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-create"
                onClick={createPost}
                disabled={creating}
              >
                {creating ? '📝 Creando...' : '📝 Crear Publicación'}
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setShowCreateForm(false)}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostsDashboard