import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export const SimpleLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    console.log('🔄 Intentando login con:', email)
    
    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        console.error('❌ Error de login:', error)
        setError((error as any)?.message || 'Error al iniciar sesión')
      } else {
        console.log('✅ Login exitoso:', data)
      }
    } catch (err: any) {
      console.error('❌ Error inesperado:', err)
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h2>Iniciar Sesión - Prueba</h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@toyotacentro.cl"
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                marginTop: '0.25rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Toyota123!"
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                marginTop: '0.25rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              required
            />
          </div>
          
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: '#fee',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
          <strong>Credenciales de prueba:</strong><br />
          admin@toyotacentro.cl / Toyota123!<br />
          vendedor@toyotacentro.cl / Vendedor123!<br />
          admin@premiummotors.cl / Premium123!<br />
          vendedor@autoindependientes.cl / Auto123!
        </div>
      </div>
    </div>
  )
}

export default SimpleLogin