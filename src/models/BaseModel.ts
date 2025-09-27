/**
 * Clase base para todos los modelos del sistema
 */
export abstract class BaseModel {
  public id: string;
  public created_at: Date;
  public updated_at: Date;

  constructor(data: any) {
    this.id = data.id || this.generateId();
    this.created_at = data.created_at ? new Date(data.created_at) : new Date();
    this.updated_at = data.updated_at ? new Date(data.updated_at) : new Date();
  }

  /**
   * Genera un UUID v4
   */
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Actualiza el timestamp de updated_at
   */
  public touch(): void {
    this.updated_at = new Date();
  }

  /**
   * Convierte el modelo a un objeto plano para la base de datos
   */
  public abstract toDatabase(): Record<string, any>;

  /**
   * Convierte el modelo a JSON
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
      ...this.toDatabase()
    };
  }

  /**
   * Valida el modelo
   */
  public abstract validate(): ValidationResult;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Interfaz para modelos que pertenecen a un tenant
 */
export interface MultiTenantModel {
  tenant_id: string;
}

/**
 * Enums comunes del sistema
 */
export enum UserType {
  BUYER = 'buyer',
  SELLER = 'seller', 
  DEALER = 'dealer'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
  PENDING = 'pending'
}