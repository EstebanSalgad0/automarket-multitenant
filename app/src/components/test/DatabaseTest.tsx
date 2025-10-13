import React, { useState, useEffect } from 'react'
import { databaseService } from '../../services/databaseService'
import './DatabaseTest.css'

interface DatabaseTestProps {
  tenantId: string
}

export const DatabaseTest: React.FC<DatabaseTestProps> = ({ tenantId }) => {
  const [schemaStatus, setSchemaStatus] = useState<{
    hasOptimizedSchema: boolean
    missingTables: string[]
    existingTables: string[]
  } | null>(null)
  
  const [systemStats, setSystemStats] = useState<{
    totalUsers: number
    totalVehicles: number
    totalLeads: number
    totalSales: number
    availableVehicles: number
    activeLeads: number
    completedSales: number
  } | null>(null)

  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tenantId) {
      checkSchemaAndLoadData()
    }
  }, [tenantId])

  const checkSchemaAndLoadData = async () => {
    if (!tenantId) return
    
    setLoading(true)
    setError(null)

    try {
      // Verificar esquema
      const schemaCheck = await databaseService.checkOptimizedTables()
      setSchemaStatus(schemaCheck)

      if (schemaCheck.hasOptimizedSchema) {
        // Cargar datos básicos
        await loadAllData()
      }
    } catch (err: any) {
      setError(err.message || 'Error verificando el esquema de la base de datos')
    } finally {
      setLoading(false)
    }
  }

  const loadAllData = async () => {
    try {
      const [
        tenantResult,
        branchesResult,
        usersResult,
        vehiclesResult,
        leadsResult,
        salesResult,
        statsResult
      ] = await Promise.all([
        databaseService.getTenantInfo(tenantId),
        databaseService.getBranches(tenantId),
        databaseService.getUsers(tenantId),
        databaseService.getVehicles(tenantId),
        databaseService.getLeads(tenantId),
        databaseService.getSales(tenantId),
        databaseService.getSystemStats(tenantId)
      ])

      setTenantInfo(tenantResult.data)
      setBranches(branchesResult.data || [])
      setUsers(usersResult.data || [])
      setVehicles(vehiclesResult.data || [])
      setLeads(leadsResult.data || [])
      setSales(salesResult.data || [])
      setSystemStats(statsResult)

    } catch (err: any) {
      setError(err.message || 'Error cargando datos')
    }
  }

  const createSampleData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Crear sucursal de muestra
      await databaseService.createRecord('branches', {
        tenant_id: tenantId,
        name: 'Sucursal de Prueba',
        code: 'TEST',
        address: 'Calle de Prueba 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        phone: '55-0000-0000',
        email: 'test@example.com',
        status: 'active'
      })

      // Crear usuario de muestra
      await databaseService.createRecord('user_profiles', {
        tenant_id: tenantId,
        email: 'test@example.com',
        user_type: 'seller',
        status: 'active',
        full_name: 'Usuario de Prueba',
        role: 'salesperson'
      })

      // Crear vehículo de muestra
      await databaseService.createRecord('vehicles', {
        tenant_id: tenantId,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Blanco',
        price: 350000,
        status: 'available',
        description: 'Vehículo de prueba'
      })

      // Recargar datos
      await loadAllData()
      
    } catch (err: any) {
      setError(err.message || 'Error creando datos de muestra')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="database-test loading">
        <div className="loading-spinner"></div>
        <p>Verificando base de datos...</p>
      </div>
    )
  }

  return (
    <div className="database-test">
      <h2>🔍 Pruebas de Base de Datos Optimizada</h2>
      
      {error && (
        <div className="error-banner">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Estado del Esquema */}
      <div className="schema-status">
        <h3>📊 Estado del Esquema</h3>
        {schemaStatus ? (
          <div>
            <div className={`status-indicator ${schemaStatus.hasOptimizedSchema ? 'success' : 'warning'}`}>
              {schemaStatus.hasOptimizedSchema ? '✅ Esquema Optimizado Disponible' : '⚠️ Esquema Optimizado Incompleto'}
            </div>
            
            {schemaStatus.existingTables.length > 0 && (
              <div className="tables-info">
                <h4>Tablas Existentes ({schemaStatus.existingTables.length}):</h4>
                <ul>
                  {schemaStatus.existingTables.map(table => (
                    <li key={table} className="table-item success">✅ {table}</li>
                  ))}
                </ul>
              </div>
            )}

            {schemaStatus.missingTables.length > 0 && (
              <div className="tables-info">
                <h4>Tablas Faltantes ({schemaStatus.missingTables.length}):</h4>
                <ul>
                  {schemaStatus.missingTables.map(table => (
                    <li key={table} className="table-item missing">❌ {table}</li>
                  ))}
                </ul>
                <p className="migration-note">
                  Para crear las tablas faltantes, ejecuta el script de migración:
                  <code>db/migration_to_optimized.sql</code>
                </p>
              </div>
            )}
          </div>
        ) : (
          <p>Verificando esquema...</p>
        )}
      </div>

      {/* Estadísticas del Sistema */}
      {systemStats && (
        <div className="system-stats">
          <h3>📈 Estadísticas del Sistema</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{systemStats.totalUsers}</span>
              <span className="stat-label">Usuarios Totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{systemStats.totalVehicles}</span>
              <span className="stat-label">Vehículos Totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{systemStats.availableVehicles}</span>
              <span className="stat-label">Vehículos Disponibles</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{systemStats.totalLeads}</span>
              <span className="stat-label">Leads Totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{systemStats.activeLeads}</span>
              <span className="stat-label">Leads Activos</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{systemStats.totalSales}</span>
              <span className="stat-label">Ventas Totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{systemStats.completedSales}</span>
              <span className="stat-label">Ventas Completadas</span>
            </div>
          </div>
        </div>
      )}

      {/* Información del Tenant */}
      {tenantInfo && (
        <div className="tenant-info">
          <h3>🏢 Información del Tenant</h3>
          <div className="info-card">
            <h4>{tenantInfo.name}</h4>
            <p><strong>Subdominio:</strong> {tenantInfo.subdomain}</p>
            <p><strong>Estado:</strong> <span className={`status ${tenantInfo.status}`}>{tenantInfo.status}</span></p>
            {tenantInfo.contact_email && <p><strong>Email:</strong> {tenantInfo.contact_email}</p>}
            {tenantInfo.contact_phone && <p><strong>Teléfono:</strong> {tenantInfo.contact_phone}</p>}
          </div>
        </div>
      )}

      {/* Resumen de Datos */}
      <div className="data-summary">
        <h3>📋 Resumen de Datos</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <h4>🏪 Sucursales</h4>
            <p>{branches.length} registros</p>
            {branches.length > 0 && (
              <ul className="data-list">
                {branches.slice(0, 3).map(branch => (
                  <li key={branch.id}>{branch.name} ({branch.code})</li>
                ))}
                {branches.length > 3 && <li>... y {branches.length - 3} más</li>}
              </ul>
            )}
          </div>

          <div className="summary-item">
            <h4>👥 Usuarios</h4>
            <p>{users.length} registros</p>
            {users.length > 0 && (
              <ul className="data-list">
                {users.slice(0, 3).map(user => (
                  <li key={user.id}>{user.full_name || user.email} ({user.user_type})</li>
                ))}
                {users.length > 3 && <li>... y {users.length - 3} más</li>}
              </ul>
            )}
          </div>

          <div className="summary-item">
            <h4>🚗 Vehículos</h4>
            <p>{vehicles.length} registros</p>
            {vehicles.length > 0 && (
              <ul className="data-list">
                {vehicles.slice(0, 3).map(vehicle => (
                  <li key={vehicle.id}>{vehicle.brand} {vehicle.model} {vehicle.year}</li>
                ))}
                {vehicles.length > 3 && <li>... y {vehicles.length - 3} más</li>}
              </ul>
            )}
          </div>

          <div className="summary-item">
            <h4>📝 Leads</h4>
            <p>{leads.length} registros</p>
            {leads.length > 0 && (
              <ul className="data-list">
                {leads.slice(0, 3).map(lead => (
                  <li key={lead.id}>{lead.full_name} - {lead.status}</li>
                ))}
                {leads.length > 3 && <li>... y {leads.length - 3} más</li>}
              </ul>
            )}
          </div>

          <div className="summary-item">
            <h4>💰 Ventas</h4>
            <p>{sales.length} registros</p>
            {sales.length > 0 && (
              <ul className="data-list">
                {sales.slice(0, 3).map(sale => (
                  <li key={sale.id}>{sale.buyer_full_name} - ${sale.sale_price?.toLocaleString()}</li>
                ))}
                {sales.length > 3 && <li>... y {sales.length - 3} más</li>}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="actions">
        <button 
          className="btn primary" 
          onClick={checkSchemaAndLoadData}
          disabled={loading}
        >
          🔄 Recargar Datos
        </button>
        
        {schemaStatus?.hasOptimizedSchema && (
          <button 
            className="btn success" 
            onClick={createSampleData}
            disabled={loading}
          >
            ➕ Crear Datos de Muestra
          </button>
        )}
      </div>
    </div>
  )
}

export default DatabaseTest