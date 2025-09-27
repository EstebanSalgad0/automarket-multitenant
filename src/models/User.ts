import { BaseModel, ValidationResult, ValidationError, MultiTenantModel, UserType, UserStatus } from './BaseModel';

/**
 * Modelo de Usuario
 */
export class User extends BaseModel implements MultiTenantModel {
  public tenant_id: string;
  public email: string;
  public phone?: string;
  public user_type: UserType;
  public status: UserStatus;
  public email_verified_at?: Date;
  public phone_verified_at?: Date;

  constructor(data: UserData) {
    super(data);
    this.tenant_id = data.tenant_id;
    this.email = data.email;
    this.phone = data.phone;
    this.user_type = data.user_type || UserType.BUYER;
    this.status = data.status || UserStatus.PENDING_VERIFICATION;
    this.email_verified_at = data.email_verified_at ? new Date(data.email_verified_at) : undefined;
    this.phone_verified_at = data.phone_verified_at ? new Date(data.phone_verified_at) : undefined;
  }

  /**
   * Factory method para crear un nuevo usuario
   */
  public static create(data: CreateUserData): User {
    return new User({
      ...data,
      id: undefined, // Se generará automáticamente
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Factory method para crear desde datos de base de datos
   */
  public static fromDatabase(data: any): User {
    return new User(data);
  }

  /**
   * Verifica el email del usuario
   */
  public verifyEmail(): void {
    this.email_verified_at = new Date();
    this.touch();
  }

  /**
   * Verifica el teléfono del usuario
   */
  public verifyPhone(): void {
    this.phone_verified_at = new Date();
    this.touch();
  }

  /**
   * Verifica si el usuario está verificado completamente
   */
  public isFullyVerified(): boolean {
    return !!(this.email_verified_at && (!this.phone || this.phone_verified_at));
  }

  /**
   * Verifica si el usuario puede vender vehículos
   */
  public canSellVehicles(): boolean {
    return this.user_type === UserType.SELLER || this.user_type === UserType.DEALER;
  }

  /**
   * Activa el usuario
   */
  public activate(): void {
    this.status = UserStatus.ACTIVE;
    this.touch();
  }

  /**
   * Suspende el usuario
   */
  public suspend(): void {
    this.status = UserStatus.SUSPENDED;
    this.touch();
  }

  /**
   * Convierte a formato de base de datos
   */
  public toDatabase(): Record<string, any> {
    return {
      tenant_id: this.tenant_id,
      email: this.email,
      phone: this.phone,
      user_type: this.user_type,
      status: this.status,
      email_verified_at: this.email_verified_at?.toISOString(),
      phone_verified_at: this.phone_verified_at?.toISOString()
    };
  }

  /**
   * Valida el modelo
   */
  public validate(): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar email
    if (!this.email) {
      errors.push({ field: 'email', message: 'Email es requerido' });
    } else if (!this.isValidEmail(this.email)) {
      errors.push({ field: 'email', message: 'Email no tiene formato válido' });
    }

    // Validar tenant_id
    if (!this.tenant_id) {
      errors.push({ field: 'tenant_id', message: 'Tenant ID es requerido' });
    }

    // Validar teléfono si está presente
    if (this.phone && !this.isValidPhone(this.phone)) {
      errors.push({ field: 'phone', message: 'Teléfono no tiene formato válido' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de teléfono
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Retorna representación string del usuario
   */
  public toString(): string {
    return `User(${this.email}, ${this.user_type}, ${this.status})`;
  }
}

/**
 * Interfaces para el modelo User
 */
export interface UserData {
  id?: string;
  tenant_id: string;
  email: string;
  phone?: string;
  user_type?: UserType;
  status?: UserStatus;
  email_verified_at?: string | Date;
  phone_verified_at?: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CreateUserData {
  tenant_id: string;
  email: string;
  phone?: string;
  user_type?: UserType;
}