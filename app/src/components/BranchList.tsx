import React, { useState, useEffect } from 'react';
import { branchService } from '../services/branchService';
import type { BranchWithManager, BranchFilters } from '../services/branchService';
import './BranchList.css';

interface BranchFormData {
  name: string;
  slug: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const BranchList: React.FC = () => {
  const [branches, setBranches] = useState<BranchWithManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchWithManager | null>(null);
  const [filters, setFilters] = useState<BranchFilters>({});
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    slug: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    status: 'active'
  });

  // Cargar sedes
  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await branchService.getBranches(filters);
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sedes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [filters]);

  // Manejar cambios en formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generar slug basado en name
    if (name === 'name' && !editingBranch) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  // Crear nueva sede
  const handleCreateBranch = async () => {
    try {
      setLoading(true);
      await branchService.createBranch({
        ...formData,
        tenant_id: '' // Se asigna automáticamente por el servicio
      });
      await loadBranches();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear sede');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar sede existente
  const handleUpdateBranch = async () => {
    if (!editingBranch) return;
    
    try {
      setLoading(true);
      await branchService.updateBranch(editingBranch.id, formData);
      await loadBranches();
      resetForm();
      setEditingBranch(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar sede');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar sede
  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la sede "${branchName}"?`)) return;
    
    try {
      setLoading(true);
      await branchService.deleteBranch(branchId);
      await loadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar sede');
    } finally {
      setLoading(false);
    }
  };

  // Editar sede
  const handleEditBranch = (branch: BranchWithManager) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      slug: branch.slug,
      address: branch.address || '',
      city: branch.city || '',
      region: branch.region || '',
      phone: branch.phone || '',
      email: branch.email || '',
      status: branch.status
    });
    setShowForm(true);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      address: '',
      city: '',
      region: '',
      phone: '',
      email: '',
      status: 'active'
    });
    setEditingBranch(null);
    setError(null);
  };

  return (
    <div className="branch-list">
      <div className="branch-list-header">
        <h2>Gestión de Sedes</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          disabled={loading}
        >
          + Nueva Sede
        </button>
      </div>

      {/* Filtros */}
      <div className="branch-filters">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
          <option value="maintenance">Mantenimiento</option>
        </select>

        <input
          type="text"
          placeholder="Filtrar por ciudad..."
          value={filters.city || ''}
          onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
        />

        <input
          type="text"
          placeholder="Filtrar por región..."
          value={filters.region || ''}
          onChange={(e) => setFilters({ ...filters, region: e.target.value || undefined })}
        />
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Lista de sedes */}
      {loading ? (
        <div className="loading">Cargando sedes...</div>
      ) : (
        <div className="branch-grid">
          {branches.map((branch) => (
            <div key={branch.id} className={`branch-card ${branch.status}`}>
              <div className="branch-header">
                <h3>{branch.name}</h3>
                <span className={`status-badge ${branch.status}`}>
                  {branch.status === 'active' ? 'Activa' : 
                   branch.status === 'inactive' ? 'Inactiva' : 'Mantenimiento'}
                </span>
              </div>
              
              <div className="branch-info">
                <p><strong>Ciudad:</strong> {branch.city || 'No especificada'}</p>
                <p><strong>Región:</strong> {branch.region || 'No especificada'}</p>
                <p><strong>Teléfono:</strong> {branch.phone || 'No especificado'}</p>
                <p><strong>Email:</strong> {branch.email || 'No especificado'}</p>
                {branch.manager && (
                  <p><strong>Encargado:</strong> {branch.manager.full_name || branch.manager.email}</p>
                )}
              </div>

              <div className="branch-actions">
                <button 
                  onClick={() => handleEditBranch(branch)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={() => handleDeleteBranch(branch.id, branch.name)}
                  className="btn btn-danger"
                  disabled={loading}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {branches.length === 0 && !loading && (
        <div className="empty-state">
          <p>No hay sedes disponibles</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Crear primera sede
          </button>
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingBranch ? 'Editar Sede' : 'Nueva Sede'}</h3>
              <button 
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre de la sede *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Sede Principal Santiago"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="Ej: sede-principal-santiago"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Santiago"
                  />
                </div>

                <div className="form-group">
                  <label>Región</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Metropolitana"
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+56 2 2345 6789"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="sede@automarket.cl"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Av. Providencia 1234, Santiago"
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                onClick={editingBranch ? handleUpdateBranch : handleCreateBranch}
                className="btn btn-primary"
                disabled={loading || !formData.name || !formData.slug}
              >
                {loading ? 'Guardando...' : (editingBranch ? 'Actualizar' : 'Crear Sede')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchList;