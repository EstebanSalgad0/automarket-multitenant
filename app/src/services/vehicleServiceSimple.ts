import { supabase } from '../lib/supabase';

export interface Vehicle {
  tenant_id: string;
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
  created_at: string;
}

export interface VehicleWithTenant extends Vehicle {
  tenants?: {
    nombre: string;
  };
}

export class VehicleServiceSimple {
  // Inicializar datos de ejemplo
  async initializeSampleData(): Promise<void> {
    try {
      // Verificar si ya hay vehículos
      const { count } = await supabase
        .from('vehiculos')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) {
        console.log('Ya existen vehículos en la base de datos');
        return;
      }

      // Crear tenant por defecto si no existe
      const { data: tenantData, error: tenantError } = await supabase
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

      const { error: vehiclesError } = await supabase
        .from('vehiculos')
        .insert(sampleVehicles);

      if (vehiclesError) {
        console.error('Error creating sample vehicles:', vehiclesError);
      } else {
        console.log('Vehículos de ejemplo creados exitosamente');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  // Obtener todos los vehículos disponibles
  async getVehicles(): Promise<{
    vehicles: VehicleWithTenant[];
    count: number;
    error: Error | null;
  }> {
    try {
      const { data, error, count } = await supabase
        .from('vehiculos')
        .select(`
          *,
          tenants (
            nombre
          )
        `, { count: 'exact' })
        .eq('estado', 'disponible')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        return { vehicles: [], count: 0, error: new Error(error.message) };
      }

      return {
        vehicles: data || [],
        count: count || 0,
        error: null
      };
    } catch (err) {
      console.error('Error in getVehicles:', err);
      return {
        vehicles: [],
        count: 0,
        error: err as Error
      };
    }
  }

  // Obtener vehículos por tenant
  async getVehiclesByTenant(tenantId: string): Promise<{
    vehicles: VehicleWithTenant[];
    count: number;
    error: Error | null;
  }> {
    try {
      const { data, error, count } = await supabase
        .from('vehiculos')
        .select(`
          *,
          tenants (
            nombre
          )
        `, { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('estado', 'disponible')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles by tenant:', error);
        return { vehicles: [], count: 0, error: new Error(error.message) };
      }

      return {
        vehicles: data || [],
        count: count || 0,
        error: null
      };
    } catch (err) {
      console.error('Error in getVehiclesByTenant:', err);
      return {
        vehicles: [],
        count: 0,
        error: err as Error
      };
    }
  }

  // Obtener vehículo por ID
  async getVehicleById(tenantId: string, vehicleId: string): Promise<{
    vehicle: VehicleWithTenant | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .select(`
          *,
          tenants (
            nombre
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('id', vehicleId)
        .single();

      if (error) {
        console.error('Error fetching vehicle by ID:', error);
        return { vehicle: null, error: new Error(error.message) };
      }

      return {
        vehicle: data,
        error: null
      };
    } catch (err) {
      console.error('Error in getVehicleById:', err);
      return {
        vehicle: null,
        error: err as Error
      };
    }
  }

  // Crear nuevo vehículo
  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'created_at'>): Promise<{
    vehicle: Vehicle | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .insert([vehicleData])
        .select()
        .single();

      if (error) {
        console.error('Error creating vehicle:', error);
        return { vehicle: null, error: new Error(error.message) };
      }

      return {
        vehicle: data,
        error: null
      };
    } catch (err) {
      console.error('Error in createVehicle:', err);
      return {
        vehicle: null,
        error: err as Error
      };
    }
  }

  // Actualizar vehículo
  async updateVehicle(tenantId: string, vehicleId: string, updates: Partial<Vehicle>): Promise<{
    vehicle: Vehicle | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .update(updates)
        .eq('tenant_id', tenantId)
        .eq('id', vehicleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating vehicle:', error);
        return { vehicle: null, error: new Error(error.message) };
      }

      return {
        vehicle: data,
        error: null
      };
    } catch (err) {
      console.error('Error in updateVehicle:', err);
      return {
        vehicle: null,
        error: err as Error
      };
    }
  }

  // Eliminar vehículo (marcar como no disponible)
  async deleteVehicle(tenantId: string, vehicleId: string): Promise<{
    success: boolean;
    error: Error | null;
  }> {
    try {
      const { error } = await supabase
        .from('vehiculos')
        .update({ estado: 'no_disponible' })
        .eq('tenant_id', tenantId)
        .eq('id', vehicleId);

      if (error) {
        console.error('Error deleting vehicle:', error);
        return { success: false, error: new Error(error.message) };
      }

      return {
        success: true,
        error: null
      };
    } catch (err) {
      console.error('Error in deleteVehicle:', err);
      return {
        success: false,
        error: err as Error
      };
    }
  }

  // Buscar vehículos con filtros
  async searchVehicles(filters: {
    marca?: string;
    modelo?: string;
    añoMin?: number;
    añoMax?: number;
    precioMin?: number;
    precioMax?: number;
    combustible?: string;
    transmision?: string;
  }): Promise<{
    vehicles: VehicleWithTenant[];
    count: number;
    error: Error | null;
  }> {
    try {
      let query = supabase
        .from('vehiculos')
        .select(`
          *,
          tenants (
            nombre
          )
        `, { count: 'exact' })
        .eq('estado', 'disponible');

      // Aplicar filtros
      if (filters.marca) {
        query = query.ilike('marca', `%${filters.marca}%`);
      }
      if (filters.modelo) {
        query = query.ilike('modelo', `%${filters.modelo}%`);
      }
      if (filters.añoMin) {
        query = query.gte('año', filters.añoMin);
      }
      if (filters.añoMax) {
        query = query.lte('año', filters.añoMax);
      }
      if (filters.precioMin) {
        query = query.gte('precio', filters.precioMin);
      }
      if (filters.precioMax) {
        query = query.lte('precio', filters.precioMax);
      }
      if (filters.combustible) {
        query = query.eq('combustible', filters.combustible);
      }
      if (filters.transmision) {
        query = query.eq('transmision', filters.transmision);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error searching vehicles:', error);
        return { vehicles: [], count: 0, error: new Error(error.message) };
      }

      return {
        vehicles: data || [],
        count: count || 0,
        error: null
      };
    } catch (err) {
      console.error('Error in searchVehicles:', err);
      return {
        vehicles: [],
        count: 0,
        error: err as Error
      };
    }
  }
}

// Exportar instancia singleton
export const vehicleServiceSimple = new VehicleServiceSimple();