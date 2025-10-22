import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import './ProfileEditor.css'

interface ProfileEditorProps {
  user: User
  onProfileUpdate?: (profile: any) => void
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onProfileUpdate }) => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Estados para cambio de contraseña
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Estado del formulario de edición
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    employee_id: '',
    salary: '',
    commission_rate: ''
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)
        setEditForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          employee_id: data.employee_id || '',
          salary: data.salary?.toString() || '',
          commission_rate: data.commission_rate?.toString() || ''
        })
      }
    } catch (err) {
      console.error('Error cargando perfil:', err)
      setError('Error cargando el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const updateData: any = {
        full_name: editForm.full_name,
        phone: editForm.phone,
        employee_id: editForm.employee_id || null,
        updated_at: new Date().toISOString()
      }

      if (editForm.salary) {
        updateData.salary = parseFloat(editForm.salary)
      }
      if (editForm.commission_rate) {
        updateData.commission_rate = parseFloat(editForm.commission_rate)
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)
      }
      setIsEditing(false)
      setSuccess('✅ Perfil actualizado exitosamente')
      
      if (onProfileUpdate) {
        onProfileUpdate(data)
      }

      setTimeout(() => setSuccess(null), 3000)

    } catch (err: any) {
      console.error('Error actualizando perfil:', err)
      setError('Error actualizando el perfil: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setPasswordLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setSuccess('✅ Contraseña actualizada exitosamente')
      setShowPasswordChange(false)
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      })

      setTimeout(() => setSuccess(null), 3000)

    } catch (err: any) {
      console.error('Error cambiando contraseña:', err)
      setError('Error cambiando la contraseña: ' + err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailChange = async (newEmail: string) => {
    if (newEmail === user.email) return

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      
      if (error) throw error

      setSuccess('✅ Se ha enviado un enlace de confirmación al nuevo email')
      setTimeout(() => setSuccess(null), 5000)

    } catch (err: any) {
      setError('Error cambiando email: ' + err.message)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-CL')
  }

  if (loading) {
    return (
      <div className="profile-editor loading">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-editor error">
        <p>Error: No se pudo cargar el perfil</p>
      </div>
    )
  }

  return (
    <div className="profile-editor">
      <div className="profile-header">
        <h2>📋 Mi Perfil</h2>
        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="btn-edit"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Editar Perfil
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="btn-save"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? '💾 Guardando...' : '💾 Guardar'}
              </button>
              <button 
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false)
                  setEditForm({
                    full_name: profile.full_name || '',
                    phone: profile.phone || '',
                    employee_id: profile.employee_id || '',
                    salary: profile.salary?.toString() || '',
                    commission_rate: profile.commission_rate?.toString() || ''
                  })
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-content">
        {/* Información Personal */}
        <div className="profile-section">
          <h3>👤 Información Personal</h3>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Nombre Completo</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  placeholder="Ingresa tu nombre completo"
                />
              ) : (
                <span>{profile.full_name || 'No especificado'}</span>
              )}
            </div>

            <div className="profile-field">
              <label>Email</label>
              <div className="email-field">
                <span>{user.email}</span>
                <button 
                  className="btn-change-email"
                  onClick={() => {
                    const newEmail = prompt('Nuevo email:', user.email)
                    if (newEmail && newEmail !== user.email) {
                      handleEmailChange(newEmail)
                    }
                  }}
                >
                  📧 Cambiar
                </button>
              </div>
            </div>

            <div className="profile-field">
              <label>Teléfono</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="+56912345678"
                />
              ) : (
                <span>{profile.phone || 'No especificado'}</span>
              )}
            </div>

            <div className="profile-field">
              <label>Rol</label>
              <span className={`role-badge ${profile.role}`}>
                {profile.role === 'corporate_admin' ? '👨‍💼 Admin Corporativo' : '👤 Vendedor'}
              </span>
            </div>
          </div>
        </div>

        {/* Información Laboral */}
        <div className="profile-section">
          <h3>💼 Información Laboral</h3>
          <div className="profile-grid">
            <div className="profile-field">
              <label>ID Empleado</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.employee_id}
                  onChange={(e) => setEditForm({...editForm, employee_id: e.target.value})}
                  placeholder="TCC-001"
                />
              ) : (
                <span>{profile.employee_id || 'No asignado'}</span>
              )}
            </div>

            <div className="profile-field">
              <label>Fecha de Contratación</label>
              <span>{formatDate(profile.hire_date || '')}</span>
            </div>

            <div className="profile-field">
              <label>Salario</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.salary}
                  onChange={(e) => setEditForm({...editForm, salary: e.target.value})}
                  placeholder="1500000"
                />
              ) : (
                <span>{profile.salary ? formatCurrency(profile.salary) : 'No especificado'}</span>
              )}
            </div>

            <div className="profile-field">
              <label>Comisión (%)</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={editForm.commission_rate}
                  onChange={(e) => setEditForm({...editForm, commission_rate: e.target.value})}
                  placeholder="15.0"
                />
              ) : (
                <span>{profile.commission_rate ? `${profile.commission_rate}%` : 'No especificado'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Cambio de Contraseña */}
        <div className="profile-section">
          <h3>🔒 Seguridad</h3>
          {!showPasswordChange ? (
            <button 
              className="btn-change-password"
              onClick={() => setShowPasswordChange(true)}
            >
              🔐 Cambiar Contraseña
            </button>
          ) : (
            <div className="password-change-form">
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
              <div className="password-actions">
                <button 
                  className="btn-save"
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? '🔐 Cambiando...' : '🔐 Cambiar Contraseña'}
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowPasswordChange(false)
                    setPasswordData({
                      newPassword: '',
                      confirmPassword: ''
                    })
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Información de Cuenta */}
        <div className="profile-section">
          <h3>ℹ️ Información de Cuenta</h3>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Usuario ID</label>
              <span className="user-id">{user.id}</span>
            </div>
            <div className="profile-field">
              <label>Cuenta Creada</label>
              <span>{formatDate(user.created_at)}</span>
            </div>
            <div className="profile-field">
              <label>Email Confirmado</label>
              <span className={user.email_confirmed_at ? 'verified' : 'unverified'}>
                {user.email_confirmed_at ? '✅ Verificado' : '⏳ Pendiente'}
              </span>
            </div>
            <div className="profile-field">
              <label>Último Acceso</label>
              <span>{formatDate(user.last_sign_in_at || '')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditor