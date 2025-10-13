import { useState, useEffect } from 'react'
import { supabase, getCurrentTenant } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface User {
  id: string
  email: string
  created_at: string
  email_confirmed_at?: string
  raw_user_meta_data?: any
}

export default function SupabaseDebugPanel() {
  const [_authUsers, _setAuthUsers] = useState<User[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [_currentTenant, setCurrentTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMinimized, setIsMinimized] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    checkSupabaseData()
  }, [])

  const checkSupabaseData = async () => {
    try {
      console.log('🔍 Verificando datos en Supabase...')
      
      const tenantSlug = getCurrentTenant()
      console.log('🏢 Tenant actual:', tenantSlug)
      
      // Obtener solo el tenant actual
      const { data: currentTenantData, error: currentTenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', tenantSlug)
        .maybeSingle()
      
      if (currentTenantError) {
        console.error('Error obteniendo tenant actual:', currentTenantError)
      } else if (currentTenantData) {
        console.log('✅ Tenant actual encontrado:', currentTenantData)
        setCurrentTenant(currentTenantData)
        setTenants([currentTenantData])
      } else {
        console.warn('⚠️ No se encontró tenant con slug:', tenantSlug)
      }

      // Intentar obtener datos del usuario actual si está logueado
      if (user) {
        console.log('👤 Usuario actual logueado:', user)
        
        // Intentar obtener perfil multitenant
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          console.warn('⚠️ No se encontró perfil multitenant:', profileError)
        } else {
          console.log('✅ Perfil multitenant encontrado:', userProfile)
        }
      }

    } catch (error) {
      console.error('❌ Error verificando Supabase:', error)
    } finally {
      setLoading(false)
    }
  }

  const testEmailSending = async () => {
    const testEmail = 'test@example.com'
    console.log('📧 Probando envío de email a:', testEmail)
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        console.error('❌ Error enviando email:', error)
      } else {
        console.log('✅ Email enviado exitosamente:', data)
      }
    } catch (err) {
      console.error('❌ Error en test de email:', err)
    }
  }

  if (loading) {
    return <div>🔄 Cargando datos de Supabase...</div>
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 255, 0.9) 100%)', 
      backdropFilter: 'blur(16px)',
      padding: isMinimized ? '12px 16px' : '24px', 
      border: '1px solid rgba(102, 126, 234, 0.2)',
      borderRadius: '20px',
      maxWidth: isMinimized ? '200px' : '420px',
      maxHeight: isMinimized ? 'auto' : '600px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '13px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.1), 0 8px 25px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: isMinimized ? 'pointer' : 'default'
    }}
    onClick={isMinimized ? () => setIsMinimized(false) : undefined}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: isMinimized ? '0' : '16px'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔍 {isMinimized ? 'Debug' : 'Panel Debug Supabase'}
        </h3>
        {!isMinimized && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            ✕
          </button>
        )}
      </div>

      {isMinimized && (
        <div style={{ fontSize: '11px', opacity: 0.7 }}>
          {user ? '✅ Logueado' : '❌ Desconectado'}
        </div>
      )}

      {!isMinimized && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#4a5568',
              borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
              paddingBottom: '8px'
            }}>👤 Usuario Actual</h4>
            {user ? (
              <div style={{ 
                background: 'rgba(34, 197, 94, 0.1)', 
                padding: '12px', 
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <div style={{ marginBottom: '4px' }}>✅ <strong>{user.email}</strong></div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  📧 {user.email_confirmed_at ? 'Verificado' : 'Pendiente verificación'}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.6 }}>
                  🆔 {user.id}
                </div>
              </div>
            ) : (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                padding: '12px', 
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                textAlign: 'center'
              }}>
                ❌ No hay usuario logueado
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#4a5568',
              borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
              paddingBottom: '8px'
            }}>🏢 Tenants ({tenants.length})</h4>
            <div style={{ 
              background: 'rgba(102, 126, 234, 0.05)', 
              padding: '12px', 
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              {tenants.map(tenant => (
                <div key={tenant.id} style={{ 
                  marginBottom: '4px',
                  fontSize: '12px'
                }}>
                  🌍 <strong>{tenant.name}</strong> ({tenant.slug})
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#4a5568',
              borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
              paddingBottom: '8px'
            }}>🧪 Pruebas</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={testEmailSending}
                style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                📧 Test Email
              </button>
              <button 
                onClick={checkSupabaseData}
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                🔄 Recargar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}