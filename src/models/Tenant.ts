import { BaseModel, ValidationResult, ValidationError, TenantStatus } from './BaseModel';

/**
 * Modelo de Tenant (Inquilino/Empresa)
 */
export class Tenant extends BaseModel {
  public name: string;
  public slug: string;
  public country_code: string;
  public currency: string;
  public timezone: string;
  public status: TenantStatus;
  public settings: TenantSettings;
  public subscription?: TenantSubscription;

  constructor(data: TenantData) {
    super(data);
    this.name = data.name;
    this.slug = data.slug || Tenant.generateSlug(data.name);
    this.country_code = data.country_code;
    this.currency = data.currency;
    this.timezone = data.timezone;
    this.status = data.status || TenantStatus.ACTIVE;
    this.settings = data.settings || this.getDefaultSettings();
    this.subscription = data.subscription;
  }

  /**
   * Factory method para crear un nuevo tenant
   */
  public static create(data: CreateTenantData): Tenant {
    return new Tenant({
      ...data,
      slug: data.slug || this.generateSlug(data.name),
      id: undefined, // Se generará automáticamente
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Factory method para crear desde datos de base de datos
   */
  public static fromDatabase(data: any): Tenant {
    return new Tenant({
      ...data,
      settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : data.settings,
      subscription: typeof data.subscription === 'string' ? JSON.parse(data.subscription) : data.subscription
    });
  }

  /**
   * Genera un slug a partir del nombre
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Remover guiones del inicio y final
  }

  /**
   * Configuración por defecto para nuevos tenants
   */
  private getDefaultSettings(): TenantSettings {
    return {
      max_vehicles: 100,
      max_users: 10,
      max_images_per_vehicle: 10,
      allow_public_listings: true,
      require_approval: false,
      contact_methods: ['email', 'phone'],
      business_hours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { open: '10:00', close: '14:00', closed: true }
      }
    };
  }

  /**
   * Activa el tenant
   */
  public activate(): void {
    this.status = TenantStatus.ACTIVE;
    this.touch();
  }

  /**
   * Desactiva el tenant
   */
  public deactivate(): void {
    this.status = TenantStatus.INACTIVE;
    this.touch();
  }

  /**
   * Pone el tenant en modo mantenimiento
   */
  public setMaintenanceMode(): void {
    this.status = TenantStatus.MAINTENANCE;
    this.touch();
  }

  /**
   * Verifica si el tenant está activo
   */
  public isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }

  /**
   * Verifica si el tenant puede agregar más vehículos
   */
  public canAddVehicles(currentCount: number): boolean {
    return currentCount < this.settings.max_vehicles;
  }

  /**
   * Verifica si el tenant puede agregar más usuarios
   */
  public canAddUsers(currentCount: number): boolean {
    return currentCount < this.settings.max_users;
  }

  /**
   * Actualiza la configuración
   */
  public updateSettings(newSettings: Partial<TenantSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.touch();
  }

  /**
   * Actualiza la suscripción
   */
  public updateSubscription(subscription: TenantSubscription): void {
    this.subscription = subscription;
    this.touch();
  }

  /**
   * Verifica si está abierto en el horario actual
   */
  public isOpenNow(): boolean {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[now.getDay()] as keyof BusinessHours;
    const daySchedule = this.settings.business_hours[dayOfWeek];
    
    if (daySchedule.closed) return false;

    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
  }

  /**
   * Convierte a formato de base de datos
   */
  public toDatabase(): Record<string, any> {
    return {
      name: this.name,
      slug: this.slug,
      country_code: this.country_code,
      currency: this.currency,
      timezone: this.timezone,
      status: this.status,
      settings: JSON.stringify(this.settings),
      subscription: this.subscription ? JSON.stringify(this.subscription) : null
    };
  }

  /**
   * Valida el modelo
   */
  public validate(): ValidationResult {
    const errors: ValidationError[] = [];

    // Validar nombre
    if (!this.name || this.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Nombre debe tener al menos 2 caracteres' });
    }

    // Validar slug
    if (!this.slug || !/^[a-z0-9-]+$/.test(this.slug)) {
      errors.push({ field: 'slug', message: 'Slug debe contener solo letras minúsculas, números y guiones' });
    }

    // Validar código de país
    if (!this.country_code || !/^[A-Z]{2}$/.test(this.country_code)) {
      errors.push({ field: 'country_code', message: 'Código de país debe ser de 2 letras mayúsculas (ej: US, MX)' });
    }

    // Validar moneda
    if (!this.currency || !/^[A-Z]{3}$/.test(this.currency)) {
      errors.push({ field: 'currency', message: 'Moneda debe ser código ISO de 3 letras (ej: USD, MXN)' });
    }

    // Validar configuraciones
    if (this.settings.max_vehicles <= 0) {
      errors.push({ field: 'max_vehicles', message: 'Máximo de vehículos debe ser mayor a 0' });
    }

    if (this.settings.max_users <= 0) {
      errors.push({ field: 'max_users', message: 'Máximo de usuarios debe ser mayor a 0' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Retorna representación string del tenant
   */
  public toString(): string {
    return `Tenant(${this.name}, ${this.slug}, ${this.status})`;
  }
}

/**
 * Interfaces y tipos relacionados
 */
export interface TenantData {
  id?: string;
  name: string;
  slug?: string;
  country_code: string;
  currency: string;
  timezone: string;
  status?: TenantStatus;
  settings?: TenantSettings;
  subscription?: TenantSubscription;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CreateTenantData {
  name: string;
  slug?: string;
  country_code: string;
  currency: string;
  timezone: string;
}

export interface TenantSettings {
  max_vehicles: number;
  max_users: number;
  max_images_per_vehicle: number;
  allow_public_listings: boolean;
  require_approval: boolean;
  contact_methods: ContactMethod[];
  business_hours: BusinessHours;
}

export interface TenantSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string; // HH:MM format
  close: string; // HH:MM format
  closed: boolean;
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing'
}

export type ContactMethod = 'email' | 'phone' | 'whatsapp' | 'telegram';