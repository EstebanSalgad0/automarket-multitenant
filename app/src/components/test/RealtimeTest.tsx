import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface RealtimeTestProps {
  tenantId?: string
}

export const RealtimeTest: React.FC<RealtimeTestProps> = ({ 
  tenantId = 'demo-tenant-id' 
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Array<{
    id: string
    timestamp: Date
    table: string
    event: string
    data: any
  }>>([])
  const [subscriptions, setSubscriptions] = useState<string[]>([])

  useEffect(() => {
    // Test de conexión básica
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('vehicles').select('count').limit(1)
        if (!error) {
          setIsConnected(true)
        }
      } catch (err) {
        console.error('Error de conexión:', err)
      }
    }

    testConnection()
  }, [])

  const addMessage = (table: string, event: string, data: any) => {
    const message = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      table,
      event,
      data
    }
    setMessages(prev => [message, ...prev.slice(0, 19)]) // Máximo 20 mensajes
  }

  const testVehiclesRealtime = () => {
    supabase
      .channel('test-vehicles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => {
          console.log('🚗 Cambio en vehicles:', payload)
          addMessage('vehicles', payload.eventType, payload.new || payload.old)
        }
      )
      .subscribe()

    setSubscriptions(prev => [...prev, 'test-vehicles'])
    addMessage('system', 'SUBSCRIBE', { table: 'vehicles', status: 'subscribed' })
  }

  const testUsersRealtime = () => {
    supabase
      .channel('test-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles'
        },
        (payload) => {
          console.log('👤 Cambio en user_profiles:', payload)
          addMessage('user_profiles', payload.eventType, payload.new || payload.old)
        }
      )
      .subscribe()

    setSubscriptions(prev => [...prev, 'test-users'])
    addMessage('system', 'SUBSCRIBE', { table: 'user_profiles', status: 'subscribed' })
  }

  const testTenantsRealtime = () => {
    supabase
      .channel('test-tenants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenants'
        },
        (payload) => {
          console.log('🏢 Cambio en tenants:', payload)
          addMessage('tenants', payload.eventType, payload.new || payload.old)
        }
      )
      .subscribe()

    setSubscriptions(prev => [...prev, 'test-tenants'])
    addMessage('system', 'SUBSCRIBE', { table: 'tenants', status: 'subscribed' })
  }

  const createTestVehicle = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('vehicles')
        .insert([{
          tenant_id: tenantId,
          brand: 'Test',
          model: 'Vehicle',
          year: 2024,
          price: 100000,
          color: 'Azul',
          status: 'available',
          description: `Vehículo de prueba creado a las ${new Date().toLocaleTimeString()}`
        }])
        .select()

      if (error) {
        addMessage('system', 'ERROR', { action: 'create_vehicle', error: error.message })
      } else {
        addMessage('system', 'SUCCESS', { action: 'create_vehicle', data })
      }
    } catch (err: any) {
      addMessage('system', 'ERROR', { action: 'create_vehicle', error: err.message })
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const getEventColor = (event: string) => {
    switch (event) {
      case 'INSERT': return '#28a745'
      case 'UPDATE': return '#ffc107'
      case 'DELETE': return '#dc3545'
      case 'SUBSCRIBE': return '#007bff'
      case 'ERROR': return '#dc3545'
      case 'SUCCESS': return '#28a745'
      default: return '#6c757d'
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔴 Prueba de Tiempo Real - Supabase</h2>
      
      {/* Estado de Conexión */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px', 
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        borderRadius: '5px',
        border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <strong>Estado de Conexión:</strong> {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      </div>

      {/* Controles */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testVehiclesRealtime}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚗 Suscribirse a Vehículos
        </button>
        
        <button 
          onClick={testUsersRealtime}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          👤 Suscribirse a Usuarios
        </button>
        
        <button 
          onClick={testTenantsRealtime}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6f42c1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🏢 Suscribirse a Tenants
        </button>
        
        <button 
          onClick={createTestVehicle}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#fd7e14', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ➕ Crear Vehículo de Prueba
        </button>
        
        <button 
          onClick={clearMessages}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpiar
        </button>
      </div>

      {/* Suscripciones Activas */}
      <div style={{ marginBottom: '20px' }}>
        <strong>Suscripciones Activas:</strong> {subscriptions.length > 0 ? subscriptions.join(', ') : 'Ninguna'}
      </div>

      {/* Log de Mensajes */}
      <div style={{ 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid #dee2e6', 
        borderRadius: '5px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ padding: '10px', borderBottom: '1px solid #dee2e6', backgroundColor: '#fff' }}>
          <strong>📡 Log de Eventos en Tiempo Real ({messages.length})</strong>
        </div>
        
        {messages.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
            No hay eventos aún. Prueba suscribirte a una tabla y crear datos.
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id}
              style={{ 
                padding: '8px 12px', 
                borderBottom: '1px solid #e9ecef',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  color: getEventColor(message.event),
                  fontWeight: 'bold'
                }}>
                  [{message.table}] {message.event}
                </span>
                <span style={{ fontSize: '0.8em', color: '#6c757d' }}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div style={{ 
                marginTop: '4px', 
                fontSize: '0.9em',
                backgroundColor: '#f8f9fa',
                padding: '4px 8px',
                borderRadius: '3px',
                maxHeight: '100px',
                overflowY: 'auto'
              }}>
                <pre>{JSON.stringify(message.data, null, 2)}</pre>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instrucciones */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '5px',
        fontSize: '0.9em'
      }}>
        <strong>💡 Instrucciones:</strong>
        <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Haz clic en los botones para suscribirte a las tablas</li>
          <li>Crea un vehículo de prueba para generar eventos</li>
          <li>Ve a otra pestaña y modifica datos en Supabase Dashboard</li>
          <li>Observa cómo aparecen los cambios en tiempo real aquí</li>
        </ol>
      </div>
    </div>
  )
}

export default RealtimeTest