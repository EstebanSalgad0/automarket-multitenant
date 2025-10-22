import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export const QuickLoginButtons = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { signIn } = useAuth()

  const handleQuickLogin = async (email: string, password: string, name: string) => {
    setLoading(true)
    setMessage(`Probando login con ${name}...`)
    
    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        setMessage(`❌ Error en ${name}: ${(error as any)?.message || 'Error desconocido'}`)
        console.error('Error:', error)
      } else {
        setMessage(`✅ Login exitoso con ${name}!`)
        console.log('Success:', data)
      }
    } catch (err: any) {
      setMessage(`❌ Error inesperado en ${name}: ${err.message}`)
      console.error('Error inesperado:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      backgroundColor: 'white', 
      padding: '1rem',
      border: '2px solid #ddd',
      borderRadius: '8px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h3>🧪 Pruebas de Login</h3>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <button
          onClick={() => handleQuickLogin('admin@toyotacentro.cl', 'Toyota123!', 'Toyota Admin')}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.25rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🏢 Toyota Admin
        </button>
        
        <button
          onClick={() => handleQuickLogin('vendedor@toyotacentro.cl', 'Vendedor123!', 'Toyota Vendedor')}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.25rem',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          👤 Toyota Vendedor
        </button>
        
        <button
          onClick={() => handleQuickLogin('admin@premiummotors.cl', 'Premium123!', 'Premium Admin')}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.25rem',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🏢 Premium Admin
        </button>
        
        <button
          onClick={() => handleQuickLogin('vendedor@autoindependientes.cl', 'Auto123!', 'Auto Vendedor')}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          👤 Auto Vendedor
        </button>
      </div>
      
      {message && (
        <div style={{ 
          fontSize: '0.8rem', 
          padding: '0.5rem',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '4px',
          marginTop: '0.5rem'
        }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default QuickLoginButtons