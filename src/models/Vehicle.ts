import { BaseModel, ValidationResult, ValidationError, MultiTenantModel, VehicleStatus } from './BaseModel';

/**
 * Modelo de Vehículo
 */
export class Vehicle extends BaseModel implements MultiTenantModel {
  public tenant_id: string;
  public seller_id: string;
  public make: string;
  public model: string;
  public year: number;
  public price: number;
  public currency: string;
  public mileage: number;
  public fuel_type: FuelType;
  public transmission: TransmissionType;
  public body_type: BodyType;
  public color: string;
  public description?: string;
  public status: VehicleStatus;
  public images: VehicleImage[];
  public features: VehicleFeature[];
  public location_city?: string;
  public location_state?: string;
  public vin?: string;
  public license_plate?: string;

  constructor(data: VehicleData) {
    super(data);
    this.tenant_id = data.tenant_id;
    this.seller_id = data.seller_id;
    this.make = data.make;
    this.model = data.model;
    this.year = data.year;
    this.price = data.price;
    this.currency = data.currency || 'USD';
    this.mileage = data.mileage;
    this.fuel_type = data.fuel_type;
    this.transmission = data.transmission;
    this.body_type = data.body_type;
    this.color = data.color;
    this.description = data.description;
    this.status = data.status || VehicleStatus.PENDING;
    this.images = data.images || [];
    this.features = data.features || [];
    this.location_city = data.location_city;
    this.location_state = data.location_state;
    this.vin = data.vin;
    this.license_plate = data.license_plate;
  }

  /**
   * Factory method para crear un nuevo vehículo
   */
  public static create(data: CreateVehicleData): Vehicle {
    return new Vehicle({
      ...data,
      id: undefined, // Se generará automáticamente
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Factory method para crear desde datos de base de datos
   */
  public static fromDatabase(data: any): Vehicle {
    return new Vehicle(data);
  }

  /**
   * Marca el vehículo como disponible
   */
  public markAsAvailable(): void {
    this.status = VehicleStatus.AVAILABLE;
    this.touch();
  }

  /**
   * Marca el vehículo como vendido
   */
  public markAsSold(): void {
    this.status = VehicleStatus.SOLD;
    this.touch();
  }

  /**
   * Marca el vehículo como reservado
   */
  public markAsReserved(): void {
    this.status = VehicleStatus.RESERVED;
    this.touch();
  }

  /**
   * Actualiza el precio
   */
  public updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    this.price = newPrice;
    this.touch();
  }

  /**
   * Agrega una imagen al vehículo
   */
  public addImage(image: VehicleImage): void {
    this.images.push(image);
    this.touch();
  }

  /**
   * Remueve una imagen del vehículo
   */
  public removeImage(imageId: string): void {
    this.images = this.images.filter(img => img.id !== imageId);
    this.touch();
  }

  /**
   * Agrega una característica al vehículo
   */
  public addFeature(feature: VehicleFeature): void {
    // Evitar duplicados
    if (!this.features.some(f => f.name === feature.name)) {
      this.features.push(feature);
      this.touch();
    }
  }

  /**
   * Remueve una característica del vehículo
   */
  public removeFeature(featureName: string): void {
    this.features = this.features.filter(f => f.name !== featureName);
    this.touch();
  }

  /**
   * Calcula la depreciación basada en el año
   */
  public calculateDepreciation(): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - this.year;
    return Math.max(0, Math.min(100, age * 10)); // 10% por año, máximo 100%
  }

  /**
   * Verifica si el vehículo está disponible para venta
   */
  public isAvailableForSale(): boolean {
    return this.status === VehicleStatus.AVAILABLE;
  }

  /**
   * Obtiene la imagen principal
   */
  public getPrimaryImage(): VehicleImage | null {
    const primaryImage = this.images.find(img => img.is_primary);
    return primaryImage || this.images[0] || null;
  }

  /**
   * Convierte a formato de base de datos
   */
  public toDatabase(): Record<string, any> {
    return {
      tenant_id: this.tenant_id,
      seller_id: this.seller_id,
      make: this.make,
      model: this.model,
      year: this.year,
      price: this.price,
      currency: this.currency,
      mileage: this.mileage,
      fuel_type: this.fuel_type,
      transmission: this.transmission,
      body_type: this.body_type,
      color: this.color,
      description: this.description,
      status: this.status,
      images: JSON.stringify(this.images),
      features: JSON.stringify(this.features),
      location_city: this.location_city,
      location_state: this.location_state,
      vin: this.vin,
      license_plate: this.license_plate
    };
  }

  /**
   * Valida el modelo
   */
  public validate(): ValidationResult {
    const errors: ValidationError[] = [];

    // Validaciones obligatorias
    if (!this.tenant_id) errors.push({ field: 'tenant_id', message: 'Tenant ID es requerido' });
    if (!this.seller_id) errors.push({ field: 'seller_id', message: 'Seller ID es requerido' });
    if (!this.make) errors.push({ field: 'make', message: 'Marca es requerida' });
    if (!this.model) errors.push({ field: 'model', message: 'Modelo es requerido' });
    
    // Validar año
    const currentYear = new Date().getFullYear();
    if (this.year < 1900 || this.year > currentYear + 1) {
      errors.push({ field: 'year', message: `Año debe estar entre 1900 y ${currentYear + 1}` });
    }

    // Validar precio
    if (this.price <= 0) {
      errors.push({ field: 'price', message: 'Precio debe ser mayor a 0' });
    }

    // Validar millaje
    if (this.mileage < 0) {
      errors.push({ field: 'mileage', message: 'Millaje no puede ser negativo' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Retorna representación string del vehículo
   */
  public toString(): string {
    return `Vehicle(${this.make} ${this.model} ${this.year}, $${this.price})`;
  }
}

/**
 * Enums específicos para vehículos
 */
export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  HYBRID = 'hybrid',
  ELECTRIC = 'electric',
  GAS = 'gas'
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CVT = 'cvt'
}

export enum BodyType {
  SEDAN = 'sedan',
  SUV = 'suv',
  HATCHBACK = 'hatchback',
  COUPE = 'coupe',
  CONVERTIBLE = 'convertible',
  PICKUP = 'pickup',
  VAN = 'van',
  WAGON = 'wagon'
}

/**
 * Interfaces relacionadas
 */
export interface VehicleImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  order: number;
}

export interface VehicleFeature {
  name: string;
  category: string;
  description?: string;
}

export interface VehicleData {
  id?: string;
  tenant_id: string;
  seller_id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency?: string;
  mileage: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  body_type: BodyType;
  color: string;
  description?: string;
  status?: VehicleStatus;
  images?: VehicleImage[];
  features?: VehicleFeature[];
  location_city?: string;
  location_state?: string;
  vin?: string;
  license_plate?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CreateVehicleData {
  tenant_id: string;
  seller_id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency?: string;
  mileage: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  body_type: BodyType;
  color: string;
  description?: string;
  location_city?: string;
  location_state?: string;
  vin?: string;
  license_plate?: string;
}