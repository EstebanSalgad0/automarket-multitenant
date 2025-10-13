import React, { useState, useEffect } from 'react'
import { customerService } from '../services/customerService'
import type { CustomerLead } from '../services/customerService'

interface CustomerLeadsProps {
  customerId: string
}

const CustomerLeads: React.FC<CustomerLeadsProps> = ({ customerId }) => {
  const [leads, setLeads] = useState<CustomerLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'contacted' | 'closed'>('all')

  useEffect(() => {
    if (customerId) {
      loadLeads()
    }
  }, [customerId])

  const loadLeads = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const customerLeads = await customerService.getCustomerLeads(customerId)
      setLeads(customerLeads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar consultas')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3cd', color: '#b45309', border: '#f6e05e' }
      case 'contacted':
        return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' }
      case 'closed':
        return { bg: '#e2e8f0', color: '#4a5568', border: '#cbd5e0' }
      default:
        return { bg: '#f7fafc', color: '#718096', border: '#e2e8f0' }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'contacted':
        return 'Contactado'
      case 'closed':
        return 'Cerrado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'contacted':
        return '📞'
      case 'closed':
        return '✅'
      default:
        return '📋'
    }
  }

  const getLeadSourceIcon = (source: string) => {
    switch (source) {
      case 'catalog':
        return '🔍'
      case 'favorites':
        return '❤️'
      case 'detail':
        return '👁️'
      default:
        return '📱'
    }
  }

  const getLeadSourceText = (source: string) => {
    switch (source) {
      case 'catalog':
        return 'Catálogo'
      case 'favorites':
        return 'Favoritos'
      case 'detail':
        return 'Detalle'
      default:
        return 'Aplicación'
    }
  }

  const filteredLeads = leads.filter(lead => 
    selectedStatus === 'all' || lead.status === selectedStatus
  )

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    margin: '16px 0'
  }

  const filterButtonStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    border: isActive ? 'none' : '1px solid #e2e8f0',
    background: isActive 
      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
      : 'white',
    color: isActive ? 'white' : '#4a5568',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    margin: '4px',
    transition: 'all 0.2s ease'
  })

  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '6px solid #e2e8f0',
            borderTop: '6px solid #4facfe',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }}></div>
          <p style={{ color: '#718096', fontSize: '16px' }}>
            Cargando tus consultas...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#e53e3e', fontSize: '18px', marginBottom: '16px' }}>
            ❌ Error al cargar consultas
          </p>
          <p style={{ color: '#718096', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </p>
          <button
            onClick={loadLeads}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
              📞 Mis Consultas
            </h3>
            <p style={{ color: '#718096', fontSize: '16px', margin: '8px 0 0 0' }}>
              {filteredLeads.length} consulta{filteredLeads.length !== 1 ? 's' : ''} 
              {selectedStatus !== 'all' && ` (${getStatusText(selectedStatus).toLowerCase()})`}
            </p>
          </div>
          
          <button
            onClick={loadLeads}
            style={{
              background: 'transparent',
              color: '#4facfe',
              border: '1px solid #4facfe',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Filtros por estado */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '500', color: '#4a5568', marginBottom: '12px' }}>
            Filtrar por estado:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => setSelectedStatus('all')}
              style={filterButtonStyle(selectedStatus === 'all')}
            >
              📋 Todas ({leads.length})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              style={filterButtonStyle(selectedStatus === 'pending')}
            >
              ⏳ Pendientes ({leads.filter(l => l.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatus('contacted')}
              style={filterButtonStyle(selectedStatus === 'contacted')}
            >
              📞 Contactadas ({leads.filter(l => l.status === 'contacted').length})
            </button>
            <button
              onClick={() => setSelectedStatus('closed')}
              style={filterButtonStyle(selectedStatus === 'closed')}
            >
              ✅ Cerradas ({leads.filter(l => l.status === 'closed').length})
            </button>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            {selectedStatus === 'all' ? (
              <>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                <h4 style={{ color: '#4a5568', fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                  No tienes consultas aún
                </h4>
                <p style={{ color: '#718096', fontSize: '16px', marginBottom: '24px' }}>
                  Cuando encuentres un vehículo que te interese, puedes contactar al vendedor directamente
                </p>
                <p style={{ color: '#a0aec0', fontSize: '14px' }}>
                  💡 Consejo: Las consultas aparecerán aquí para que puedas hacer seguimiento de tus intereses
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h4 style={{ color: '#4a5568', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  No hay consultas {getStatusText(selectedStatus).toLowerCase()}
                </h4>
                <p style={{ color: '#718096', fontSize: '14px' }}>
                  Cambia el filtro para ver consultas en otros estados
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredLeads.map((lead) => {
              const statusStyle = getStatusColor(lead.status)
              return (
                <div
                  key={lead.id}
                  style={{
                    background: '#fafafa',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
                          Consulta #{lead.id.slice(-6)}
                        </h4>
                        <div style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {getStatusIcon(lead.status)} {getStatusText(lead.status)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#718096' }}>
                        <span>
                          📅 {new Date(lead.created_at).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>
                          {getLeadSourceIcon(lead.lead_source || 'application')} {getLeadSourceText(lead.lead_source || 'application')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información del vehículo (si está disponible) */}
                  {lead.vehicle_id && (
                    <div style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '20px'
                        }}>
                          🚗
                        </div>
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', margin: '0 0 4px 0' }}>
                            Vehículo ID: {lead.vehicle_id.slice(-8)}
                          </p>
                          <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                            Consulta sobre este vehículo específico
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            // TODO: Abrir detalle del vehículo
                            console.log('Ver vehículo:', lead.vehicle_id)
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid #4facfe',
                            color: '#4facfe',
                            padding: '6px 12px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            marginLeft: 'auto'
                          }}
                        >
                          Ver Vehículo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mensaje de la consulta */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>
                      💬 Tu mensaje:
                    </h5>
                    <p style={{ fontSize: '14px', color: '#1a202c', margin: 0, lineHeight: '1.5' }}>
                      {lead.message}
                    </p>
                  </div>

                  {/* Respuesta del vendedor (si existe) */}
                  {lead.seller_response && (
                    <div style={{
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
                        📧 Respuesta del vendedor:
                      </h5>
                      <p style={{ fontSize: '14px', color: '#1e40af', margin: 0, lineHeight: '1.5' }}>
                        {lead.seller_response}
                      </p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {lead.status === 'pending' && (
                      <div style={{
                        background: '#fef3cd',
                        color: '#b45309',
                        padding: '8px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        flex: 1
                      }}>
                        ⏳ Esperando respuesta del vendedor...
                      </div>
                    )}
                    
                    {lead.status === 'contacted' && !lead.seller_response && (
                      <div style={{
                        background: '#d4edda',
                        color: '#155724',
                        padding: '8px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        flex: 1
                      }}>
                        📞 El vendedor te contactará pronto
                      </div>
                    )}

                    <button
                      onClick={() => {
                        // TODO: Mostrar más detalles o acciones
                        console.log('Ver detalles de consulta:', lead.id)
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid #e2e8f0',
                        color: '#4a5568',
                        padding: '8px 16px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      📋 Detalles
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Estadísticas y consejos */}
      {leads.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '16px' }}>
            📊 Resumen de tus consultas
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ 
              background: '#fef3cd', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #f6e05e',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#b45309' }}>
                {leads.filter(l => l.status === 'pending').length}
              </div>
              <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '600' }}>
                Pendientes
              </div>
            </div>
            
            <div style={{ 
              background: '#d4edda', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #c3e6cb',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📞</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#155724' }}>
                {leads.filter(l => l.status === 'contacted').length}
              </div>
              <div style={{ fontSize: '12px', color: '#155724', fontWeight: '600' }}>
                Contactadas
              </div>
            </div>
            
            <div style={{ 
              background: '#e2e8f0', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #cbd5e0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#4a5568' }}>
                {leads.filter(l => l.status === 'closed').length}
              </div>
              <div style={{ fontSize: '12px', color: '#4a5568', fontWeight: '600' }}>
                Cerradas
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: '#f7fafc', borderRadius: '12px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>
              💡 Consejos para mejores resultados:
            </h5>
            <ul style={{ fontSize: '12px', color: '#718096', margin: 0, paddingLeft: '16px' }}>
              <li>Sé específico en tus preguntas sobre el vehículo</li>
              <li>Incluye tu disponibilidad para una inspección</li>
              <li>Pregunta sobre el historial de mantenimiento</li>
              <li>Confirma que el precio incluye todos los documentos</li>
            </ul>
          </div>
        </div>
      )}

      {/* CSS para animaciones */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default CustomerLeads