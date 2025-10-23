import React, { useState, useEffect } from 'react';

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  kilometraje: number;
  color: string;
  combustible: string;
  transmision: string;
  descripcion: string;
  estado: string;
  tenant_id: string;
}

interface VehicleListProps {
  onBack: () => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ onBack }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      
      // Por ahora, vamos a usar datos de ejemplo que simulan los datos reales
      // En una implementación completa, esto se conectaría a la API con autenticación
      const sampleVehiclesFromDB: Vehicle[] = [
        {
          id: '59f78bf8-c593-4604-873e-80bb51911774',
          marca: 'Toyota',
          modelo: 'Corolla',
          año: 2023,
          precio: 379900,
          kilometraje: 15000,
          color: 'Blanco',
          combustible: 'Gasolina',
          transmision: 'Automática',
          descripcion: 'Vehículo en excelente estado, único dueño, revisiones al día',
          estado: 'disponible',
          tenant_id: '11111111-1111-1111-1111-111111111111'
        },
        {
          id: '9322374f-d62e-4866-ab9f-7d1f355c0a69',
          marca: 'Toyota',
          modelo: 'RAV4',
          año: 2022,
          precio: 519900,
          kilometraje: 25000,
          color: 'Azul',
          combustible: 'Gasolina',
          transmision: 'Automática',
          descripcion: 'SUV familiar, perfecto para aventuras',
          estado: 'disponible',
          tenant_id: '11111111-1111-1111-1111-111111111111'
        },
        {
          id: '2397d998-5fa0-40d1-80a7-21f6a27357c4',
          marca: 'Toyota',
          modelo: 'Camry',
          año: 2022,
          precio: 469900,
          kilometraje: 18000,
          color: 'Negro',
          combustible: 'Gasolina',
          transmision: 'Automática',
          descripcion: 'Sedan ejecutivo, muy cómodo y elegante',
          estado: 'disponible',
          tenant_id: '11111111-1111-1111-1111-111111111111'
        },
        {
          id: 'f9d8cfc7-7384-4431-8c56-27d9056f3202',
          marca: 'Honda',
          modelo: 'Civic',
          año: 2020,
          precio: 325000,
          kilometraje: 35000,
          color: 'Rojo',
          combustible: 'Gasolina',
          transmision: 'Manual',
          descripcion: 'Deportivo y eficiente, ideal para jóvenes',
          estado: 'disponible',
          tenant_id: '22222222-2222-2222-2222-222222222222'
        },
        {
          id: '4e2d5e68-beb8-4ba7-aa9b-8b86ceb6bb16',
          marca: 'Volkswagen',
          modelo: 'Jetta',
          año: 2019,
          precio: 285000,
          kilometraje: 42000,
          color: 'Plata',
          combustible: 'Gasolina',
          transmision: 'Automática',
          descripcion: 'Calidad alemana, muy confiable',
          estado: 'disponible',
          tenant_id: '22222222-2222-2222-2222-222222222222'
        },
        {
          id: '7e3c88ce-c44f-41f3-8160-5dca5d1187a1',
          marca: 'Nissan',
          modelo: 'Sentra',
          año: 2018,
          precio: 195000,
          kilometraje: 65000,
          color: 'Gris',
          combustible: 'Gasolina',
          transmision: 'CVT',
          descripcion: 'Económico y rendidor, ideal para ciudad',
          estado: 'disponible',
          tenant_id: '33333333-3333-3333-3333-333333333333'
        },
        {
          id: '26670a6e-82b8-41e3-952f-e3053d0e44b2',
          marca: 'Ford',
          modelo: 'Focus',
          año: 2017,
          precio: 178000,
          kilometraje: 78000,
          color: 'Azul',
          combustible: 'Gasolina',
          transmision: 'Manual',
          descripcion: 'Compacto y ágil, perfecto para la ciudad',
          estado: 'disponible',
          tenant_id: '33333333-3333-3333-3333-333333333333'
        }
      ];

      // Agregar los vehículos que hayas creado tú también
      const yourNewVehicles = JSON.parse(localStorage.getItem('userVehicles') || '[]');
      
      const allVehicles = [...sampleVehiclesFromDB, ...yourNewVehicles];
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVehicles(allVehicles);
    } catch (err) {
      setError('Error al cargar los vehículos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('es-CL').format(mileage) + ' km';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          Cargando vehículos...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Volver al inicio
        </button>
        <h1 style={{ color: '#1a202c', margin: 0 }}>
          🚗 Catálogo de Vehículos Disponibles
        </h1>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '20px' 
      }}>
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Imagen placeholder */}
            <div style={{
              width: '100%',
              height: '200px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}>
              🚗
            </div>

            {/* Información del vehículo */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ color: '#1a202c', margin: 0, fontSize: '20px', fontWeight: '600' }}>
                  {vehicle.marca} {vehicle.modelo}
                </h3>
                <span style={{
                  backgroundColor: vehicle.estado === 'disponible' ? '#d1fae5' : '#fef3c7',
                  color: vehicle.estado === 'disponible' ? '#065f46' : '#92400e',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {vehicle.estado === 'disponible' ? 'Disponible' : vehicle.estado}
                </span>
              </div>

              <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669', marginBottom: '15px' }}>
                {formatPrice(vehicle.precio)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <strong>Año:</strong> {vehicle.año}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <strong>Kilometraje:</strong> {formatMileage(vehicle.kilometraje)}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <strong>Color:</strong> {vehicle.color}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <strong>Combustible:</strong> {vehicle.combustible}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <strong>Transmisión:</strong> {vehicle.transmision}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <strong>Concesionario:</strong> {vehicle.tenant_id}
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', margin: '0 0 15px 0' }}>
                {vehicle.descripcion}
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Ver detalles
                </button>
                <button style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Contactar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚗</div>
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No hay vehículos disponibles</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Los vehículos agregados aparecerán aquí
          </p>
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
          📊 Total de vehículos disponibles: <strong>{vehicles.length}</strong>
        </p>
      </div>
    </div>
  );
};

export default VehicleList;