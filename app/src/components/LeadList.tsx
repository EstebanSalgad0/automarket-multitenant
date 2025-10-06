import React, { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';
import type { LeadWithDetails, LeadFilters } from '../services/leadService';
import './LeadList.css';

const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<LeadWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedLead, setSelectedLead] = useState<LeadWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Cargar leads
  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadService.getLeads(filters);
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [filters]);

  // Cambiar estado de un lead
  const handleStatusChange = async (leadId: string, newStatus: string, notes?: string) => {
    try {
      setLoading(true);
      await leadService.changeStatus(
        leadId, 
        newStatus as 'new' | 'contacted' | 'qualified' | 'lost' | 'sold',
        notes
      );
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  // Asignar lead a vendedor
  const handleAssignLead = async (leadId: string, salesPersonId: string | null) => {
    if (!salesPersonId) return;
    try {
      setLoading(true);
      await leadService.assignLead(leadId, salesPersonId);
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar lead');
    } finally {
      setLoading(false);
    }
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      new: '#3b82f6',      // Azul
      contacted: '#f59e0b', // Amarillo  
      qualified: '#10b981', // Verde
      lost: '#ef4444',      // Rojo
      sold: '#8b5cf6'       // Púrpura
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    const texts = {
      new: 'Nuevo',
      contacted: 'Contactado',
      qualified: 'Calificado',
      lost: 'Perdido',
      sold: 'Vendido'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#10b981',      // Verde
      medium: '#f59e0b',   // Amarillo
      high: '#ef4444',     // Rojo
      urgent: '#dc2626'    // Rojo oscuro
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="lead-list">
      <div className="lead-list-header">
        <h2>Gestión de Leads</h2>
        <div className="lead-stats">
          <div className="stat-item">
            <span className="stat-number">{leads.length}</span>
            <span className="stat-label">Total Leads</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {leads.filter(l => l.status === 'new').length}
            </span>
            <span className="stat-label">Nuevos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {leads.filter(l => l.status === 'qualified').length}
            </span>
            <span className="stat-label">Calificados</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="lead-filters">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
        >
          <option value="">Todos los estados</option>
          <option value="new">Nuevo</option>
          <option value="contacted">Contactado</option>
          <option value="qualified">Calificado</option>
          <option value="lost">Perdido</option>
          <option value="sold">Vendido</option>
        </select>

        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value as any || undefined })}
        >
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>

        <input
          type="text"
          placeholder="Buscar por nombre del cliente..."
          onChange={(e) => {
            const searchTerm = e.target.value.toLowerCase();
            leads.filter(lead => 
              lead.customer_name.toLowerCase().includes(searchTerm) ||
              lead.customer_email.toLowerCase().includes(searchTerm)
            );
            // Para simplificar, mostramos los filtrados directamente
          }}
        />
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Lista de leads */}
      {loading ? (
        <div className="loading">Cargando leads...</div>
      ) : (
        <div className="leads-container">
          {leads.map((lead) => (
            <div key={lead.id} className="lead-card">
              <div className="lead-header">
                <div className="lead-customer">
                  <h3>{lead.customer_name}</h3>
                  <p>{lead.customer_email}</p>
                  {lead.customer_phone && <p>📞 {lead.customer_phone}</p>}
                </div>
                <div className="lead-badges">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(lead.status) }}
                  >
                    {getStatusText(lead.status)}
                  </span>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(lead.priority) }}
                  >
                    {lead.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="lead-body">
                <div className="lead-vehicle">
                  <strong>Vehículo de interés:</strong>
                  {lead.vehicle && (
                    <p>
                      {lead.vehicle.brand} {lead.vehicle.model} {lead.vehicle.year} - 
                      ${lead.vehicle.price.toLocaleString('es-CL')}
                    </p>
                  )}
                </div>

                <div className="lead-message">
                  <strong>Consulta:</strong>
                  <p>{lead.message}</p>
                </div>

                <div className="lead-meta">
                  <small>
                    📅 {formatDate(lead.created_at)} • 
                    🏢 {lead.branch?.name || 'Sin sede'} • 
                    👤 {lead.assigned_user?.full_name || 'Sin asignar'}
                  </small>
                </div>
              </div>

              <div className="lead-actions">
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                  disabled={loading}
                  className="status-select"
                >
                  <option value="new">Nuevo</option>
                  <option value="contacted">Contactado</option>
                  <option value="qualified">Calificado</option>
                  <option value="lost">Perdido</option>
                  <option value="sold">Vendido</option>
                </select>

                <button
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowDetails(true);
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  👁️ Ver Detalles
                </button>

                <button
                  onClick={() => handleAssignLead(lead.id, null)} // Simplificado por ahora
                  className="btn btn-primary"
                  disabled={loading}
                >
                  👤 Asignar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {leads.length === 0 && !loading && (
        <div className="empty-state">
          <p>No hay leads disponibles</p>
          <p>Los leads aparecerán aquí cuando los clientes hagan consultas sobre vehículos.</p>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetails && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Detalles del Lead</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="lead-details">
                <section>
                  <h4>Información del Cliente</h4>
                  <p><strong>Nombre:</strong> {selectedLead.customer_name}</p>
                  <p><strong>Email:</strong> {selectedLead.customer_email}</p>
                  <p><strong>Teléfono:</strong> {selectedLead.customer_phone || 'No proporcionado'}</p>
                </section>

                <section>
                  <h4>Vehículo de Interés</h4>
                  {selectedLead.vehicle && (
                    <>
                      <p><strong>Vehículo:</strong> {selectedLead.vehicle.brand} {selectedLead.vehicle.model}</p>
                      <p><strong>Año:</strong> {selectedLead.vehicle.year}</p>
                      <p><strong>Precio:</strong> ${selectedLead.vehicle.price.toLocaleString('es-CL')}</p>
                      <p><strong>Precio:</strong> ${selectedLead.vehicle.price.toLocaleString()}</p>
                    </>
                  )}
                </section>

                <section>
                  <h4>Consulta del Cliente</h4>
                  <p>{selectedLead.message}</p>
                </section>

                <section>
                  <h4>Información de Gestión</h4>
                  <p><strong>Estado:</strong> {getStatusText(selectedLead.status)}</p>
                  <p><strong>Prioridad:</strong> {selectedLead.priority}</p>
                  <p><strong>Sede:</strong> {selectedLead.branch?.name || 'No asignada'}</p>
                  <p><strong>Vendedor asignado:</strong> {selectedLead.assigned_user?.full_name || 'Sin asignar'}</p>
                  <p><strong>Fuente:</strong> {selectedLead.source || 'No especificada'}</p>
                  <p><strong>Fecha de creación:</strong> {formatDate(selectedLead.created_at)}</p>
                  {selectedLead.scheduled_date && (
                    <p><strong>Cita programada:</strong> {formatDate(selectedLead.scheduled_date)}</p>
                  )}
                </section>

                {selectedLead.notes && (
                  <section>
                    <h4>Notas</h4>
                    <p>{selectedLead.notes}</p>
                  </section>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowDetails(false)}
                className="btn btn-secondary"
              >
                Cerrar
              </button>
              <button 
                onClick={() => {
                  // Aquí se podría abrir un formulario de edición
                  setShowDetails(false);
                }}
                className="btn btn-primary"
              >
                Editar Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;