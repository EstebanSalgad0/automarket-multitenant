// Exportar modelos base
export * from './BaseModel';

// Exportar modelos específicos
export * from './User';
export * from './Vehicle';
export * from './Tenant';

// Exportar repositorios (para implementar después)
// export * from './repositories/UserRepository';
// export * from './repositories/VehicleRepository';
// export * from './repositories/TenantRepository';

/**
 * Factory para crear modelos desde datos de API/Database
 */
export class ModelFactory {
  /**
   * Crea un modelo User desde datos raw
   */
  static createUser(data: any) {
    return User.fromDatabase(data);
  }

  /**
   * Crea un modelo Vehicle desde datos raw
   */
  static createVehicle(data: any) {
    return Vehicle.fromDatabase(data);
  }

  /**
   * Crea un modelo Tenant desde datos raw
   */
  static createTenant(data: any) {
    return Tenant.fromDatabase(data);
  }

  /**
   * Crea múltiples modelos User desde un array
   */
  static createUsers(dataArray: any[]) {
    return dataArray.map(data => User.fromDatabase(data));
  }

  /**
   * Crea múltiples modelos Vehicle desde un array
   */
  static createVehicles(dataArray: any[]) {
    return dataArray.map(data => Vehicle.fromDatabase(data));
  }

  /**
   * Crea múltiples modelos Tenant desde un array
   */
  static createTenants(dataArray: any[]) {
    return dataArray.map(data => Tenant.fromDatabase(data));
  }
}

// Re-exportar las clases principales
import { User } from './User';
import { Vehicle } from './Vehicle';
import { Tenant } from './Tenant';