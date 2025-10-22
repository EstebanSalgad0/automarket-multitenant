import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './VehiclesCatalog.css';

interface SimpleVehicle {
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
}

interface VehiclesCatalogWorkingProps {
  onBack: () => void;
}

const VehiclesCatalogWorking: React.FC<VehiclesCatalogWorkingProps> = ({ onBack }) => {
  const [vehicles, setVehicles] = useState<SimpleVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar datos y cargar vehículos
  useEffect(() => {
    initializeAndLoadVehicles();
  }, []);

  const initializeAndLoadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primero verificar si ya hay vehículos
      const { count } = await supabase
        .from('vehiculos')
        .select('*', { count: 'exact', head: true });

      // Si no hay vehículos, crear algunos de ejemplo
      if (!count || count === 0) {
        console.log('Creando vehículos de ejemplo...');
        
        // Crear tenant por defecto si no existe
        await (supabase as any)
          .from('tenants')
          .upsert([
            { id: 'default-tenant', nombre: 'AutoMarket Demo' }
          ], { onConflict: 'id' });

        // Crear vehículos de ejemplo
        const sampleVehicles = [
          {
            tenant_id: 'default-tenant',
            marca: 'Toyota',
            modelo: 'Corolla',
            año: 2022,
            precio: 25000000,
            kilometraje: 15000,
            color: 'Blanco',
            combustible: 'Gasolina',
            transmision: 'Automático',
            descripcion: 'Vehículo en excelente estado, único dueño, revisiones al día',
            estado: 'disponible'
          },
          {
            tenant_id: 'default-tenant',
            marca: 'Honda',
            modelo: 'Civic',
            año: 2023,
            precio: 28000000,
            kilometraje: 8000,
            color: 'Azul',
            combustible: 'Gasolina',
            transmision: 'Manual',
            descripcion: 'Carro deportivo, excelente rendimiento, como nuevo',
            estado: 'disponible'
          },
          {
            tenant_id: 'default-tenant',
            marca: 'Chevrolet',
            modelo: 'Spark',
            año: 2021,
            precio: 18000000,
            kilometraje: 25000,
            color: 'Rojo',
            combustible: 'Gasolina',
            transmision: 'Manual',
            descripcion: 'Ideal para ciudad, bajo consumo, muy cuidado',
            estado: 'disponible'
          },
          {
            tenant_id: 'default-tenant',
            marca: 'Nissan',
            modelo: 'Sentra',
            año: 2022,
            precio: 26500000,
            kilometraje: 12000,
            color: 'Negro',
            combustible: 'Gasolina',
            transmision: 'Automático',
            descripcion: 'Sedán elegante, aire acondicionado, sistema de audio',
            estado: 'disponible'
          },
          {
            tenant_id: 'default-tenant',
            marca: 'Hyundai',
            modelo: 'Accent',
            año: 2023,
            precio: 22000000,
            kilometraje: 5000,
            color: 'Gris',
            combustible: 'Gasolina',
            transmision: 'Automático',
            descripcion: 'Vehículo prácticamente nuevo, garantía vigente',
            estado: 'disponible'
          }
        ];

        const { error: insertError } = await (supabase as any)
          .from('vehiculos')
          .insert(sampleVehicles);

        if (insertError) {
          console.error('Error creating sample vehicles:', insertError);
        } else {
          console.log('Vehículos de ejemplo creados exitosamente');
        }
      }

      // Cargar vehículos
      const { data, error: fetchError } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('estado', 'disponible')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setVehicles(data || []);
      console.log('Vehículos cargados:', data?.length || 0);

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  const formatMileage = (mileage: number) => {
    return `${mileage.toLocaleString('es-CL')} km`;
  };

  if (loading) {
    return (
      <div className="vehicles-catalog">
        <div className="catalog-header">
          <button onClick={onBack} className="back-button">
            ← Volver al inicio
          </button>
          <h1>Catálogo de Vehículos</h1>
        </div>
        <div className="loading-state">Cargando vehículos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicles-catalog">
        <div className="catalog-header">
          <button onClick={onBack} className="back-button">
            ← Volver al inicio
          </button>
          <h1>Catálogo de Vehículos</h1>
        </div>
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={initializeAndLoadVehicles} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicles-catalog">
      <div className="catalog-header">
        <button onClick={onBack} className="back-button">
          ← Volver al inicio
        </button>
        <h1>Catálogo de Vehículos</h1>
        <p>Mostrando {vehicles.length} vehículos disponibles</p>
      </div>

      <div className="vehicles-grid grid">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-images">
              <img 
                src={`https://placehold.co/400x300/4299E1/ffffff?text=${encodeURIComponent(vehicle.marca + ' ' + vehicle.modelo)}`}
                alt={`${vehicle.marca} ${vehicle.modelo}`}
              />
              <div className="seller-badge">🏢 Concesionario</div>
            </div>
            <div className="vehicle-info">
              <h3 className="vehicle-title">{vehicle.marca} {vehicle.modelo}</h3>
              <div className="vehicle-price">{formatPrice(vehicle.precio)}</div>
              <div className="vehicle-details">
                <span>{vehicle.año}</span>
                <span>{formatMileage(vehicle.kilometraje)}</span>
                <span>{vehicle.transmision}</span>
                <span>{vehicle.combustible}</span>
              </div>
              <div className="vehicle-location">
                <span>📍 Chile</span>
                <span className="seller-name">AutoMarket Demo</span>
              </div>
              <div className="vehicle-description">
                <p>{vehicle.descripcion}</p>
              </div>
              <div className="vehicle-actions">
                <button className="contact-button">Contactar Vendedor</button>
                <button className="favorite-button">❤️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="empty-state">
          <p>No hay vehículos disponibles en este momento.</p>
          <button onClick={initializeAndLoadVehicles} className="retry-button">
            Recargar
          </button>
        </div>
      )}
    </div>
  );
};

export default VehiclesCatalogWorking;