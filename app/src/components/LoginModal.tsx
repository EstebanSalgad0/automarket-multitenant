import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getCurrentTenant } from '../lib/supabase'
import './LoginModal.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialMode?: 'login' | 'register'
}

interface FormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  userType: 'buyer' | 'seller' | 'dealer'
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialMode = 'login' 
}: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'buyer'
  })

  const { signIn, signUp, resetPassword } = useAuth()
  const currentTenant = getCurrentTenant()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
    setMessage('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos')
      return false
    }

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        return false
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return false
      }
      if (!formData.firstName || !formData.lastName) {
        setError('Por favor completa tu nombre y apellido')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password)
        
        if (error) {
          setError(typeof error === 'string' ? error : (error as any)?.message || 'Error al iniciar sesión')
        } else {
          setMessage('¡Inicio de sesión exitoso!')
          setTimeout(() => {
            onSuccess?.()
            onClose()
          }, 1000)
        }
      } 
      else if (mode === 'register') {
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.userType,
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone
          }
        )
        
        if (error) {
          setError(typeof error === 'string' ? error : (error as any)?.message || 'Error al crear la cuenta')
        } else {
          setMessage('¡Cuenta creada exitosamente! Revisa tu email para verificar tu cuenta.')
          setTimeout(() => {
            setMode('login')
            setMessage('')
          }, 3000)
        }
      }
      else if (mode === 'forgot-password') {
        const { error } = await resetPassword(formData.email)
        
        if (error) {
          setError(typeof error === 'string' ? error : (error as any)?.message || 'Error al enviar el email')
        } else {
          setMessage('Te hemos enviado un enlace para restablecer tu contraseña')
        }
      }
    } catch (err) {
      setError('Ha ocurrido un error inesperado')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="login-header">
          <h2>
            {mode === 'login' && '🔐 Iniciar Sesión'}
            {mode === 'register' && '📝 Crear Cuenta'}
            {mode === 'forgot-password' && '🔑 Recuperar Contraseña'}
          </h2>
          <p className="tenant-info">
            🌍 Conectando a <strong>AutoMarket {currentTenant.toUpperCase()}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="tu@email.com"
            />
          </div>

          {/* Password (not for forgot password) */}
          {mode !== 'forgot-password' && (
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
              />
            </div>
          )}

          {/* Register-specific fields */}
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Juan"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Apellido *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="form-group">
                <label htmlFor="userType">Tipo de Usuario *</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="buyer">🛒 Comprador</option>
                  <option value="seller">🚗 Vendedor Individual</option>
                  <option value="dealer">🏢 Concesionario/Dealer</option>
                </select>
              </div>
            </>
          )}

          {/* Messages */}
          {error && <div className="error-message">❌ {error}</div>}
          {message && <div className="success-message">✅ {message}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? '⏳ Procesando...' : (
              mode === 'login' ? '🔐 Iniciar Sesión' :
              mode === 'register' ? '📝 Crear Cuenta' :
              '📧 Enviar Enlace'
            )}
          </button>

          {/* Mode Switchers */}
          <div className="mode-switchers">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="link-button"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="link-button"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </>
            )}
            
            {mode === 'register' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="link-button"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            )}
            
            {mode === 'forgot-password' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="link-button"
              >
                ← Volver al inicio de sesión
              </button>
            )}
          </div>
        </form>

        <div className="login-footer">
          <p>🔒 Tu información está protegida con encriptación SSL</p>
          <p>📱 Sistema multitenant para {currentTenant}</p>
        </div>
      </div>
    </div>
  )
}