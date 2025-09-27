/**
 * Ejemplos de uso de los modelos de AutoMarket MultiTenant
 * 
 * Este archivo demuestra cómo usar los modelos para:
 * - Crear nuevas instancias
 * - Validar datos
 * - Manipular objetos
 * - Convertir entre formatos
 */

import { 
  User, 
  Vehicle, 
  Tenant, 
  ModelFactory,
  UserType, 
  UserStatus,
  VehicleStatus,
  FuelType,
  TransmissionType,
  BodyType,
  TenantStatus 
} from './index';

// ========================================
// EJEMPLOS DE USO - TENANT
// ========================================

/**
 * Ejemplo 1: Crear un nuevo Tenant
 */
export function createNewTenant() {
  const newTenant = Tenant.create({
    name: "AutoDealer Pro",
    country_code: "US",
    currency: "USD",
    timezone: "America/New_York"
  });

  console.log('Nuevo tenant creado:', newTenant.toString());
  console.log('Slug generado:', newTenant.slug);
  console.log('¿Está activo?', newTenant.isActive());
  
  return newTenant;
}

/**
 * Ejemplo 2: Validar un Tenant
 */
export function validateTenant() {
  const tenant = new Tenant({
    name: "", // Error: nombre vacío
    slug: "invalid-SLUG!", // Error: slug inválido
    country_code: "USA", // Error: debe ser 2 letras
    currency: "DOLLAR", // Error: debe ser código ISO
    timezone: "UTC"
  });

  const validation = tenant.validate();
  console.log('Validación:', validation);
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      console.error(`Error en ${error.field}: ${error.message}`);
    });
  }
}

// ========================================
// EJEMPLOS DE USO - USER
// ========================================

/**
 * Ejemplo 3: Crear un nuevo Usuario
 */
export function createNewUser(tenantId: string) {
  const newUser = User.create({
    tenant_id: tenantId,
    email: "juan.perez@email.com",
    phone: "+1-555-123-4567",
    user_type: UserType.SELLER
  });

  console.log('Nuevo usuario creado:', newUser.toString());
  console.log('¿Puede vender vehículos?', newUser.canSellVehicles());
  console.log('¿Está verificado?', newUser.isFullyVerified());

  // Simular verificación de email
  newUser.verifyEmail();
  console.log('Email verificado:', newUser.email_verified_at);

  return newUser;
}

/**
 * Ejemplo 4: Manejar estados de usuario
 */
export function manageUserStates(user: User) {
  console.log('Estado inicial:', user.status);

  // Activar usuario
  user.activate();
  console.log('Usuario activado:', user.status);

  // Suspender usuario
  user.suspend();
  console.log('Usuario suspendido:', user.status);
}

// ========================================
// EJEMPLOS DE USO - VEHICLE
// ========================================

/**
 * Ejemplo 5: Crear un nuevo Vehículo
 */
export function createNewVehicle(tenantId: string, sellerId: string) {
  const newVehicle = Vehicle.create({
    tenant_id: tenantId,
    seller_id: sellerId,
    make: "Toyota",
    model: "Camry",
    year: 2022,
    price: 25000,
    currency: "USD",
    mileage: 15000,
    fuel_type: FuelType.GASOLINE,
    transmission: TransmissionType.AUTOMATIC,
    body_type: BodyType.SEDAN,
    color: "Blanco",
    description: "Vehículo en excelente estado, único dueño",
    location_city: "Miami",
    location_state: "FL"
  });

  console.log('Nuevo vehículo creado:', newVehicle.toString());
  console.log('¿Disponible para venta?', newVehicle.isAvailableForSale());
  console.log('Depreciación estimada:', `${newVehicle.calculateDepreciation()}%`);

  return newVehicle;
}

/**
 * Ejemplo 6: Manejar imágenes y características del vehículo
 */
export function manageVehicleDetails(vehicle: Vehicle) {
  // Agregar imágenes
  vehicle.addImage({
    id: "img1",
    url: "https://example.com/car1.jpg",
    alt_text: "Vista frontal",
    is_primary: true,
    order: 1
  });

  vehicle.addImage({
    id: "img2", 
    url: "https://example.com/car2.jpg",
    alt_text: "Vista lateral",
    is_primary: false,
    order: 2
  });

  console.log('Imagen principal:', vehicle.getPrimaryImage());

  // Agregar características
  vehicle.addFeature({
    name: "Aire Acondicionado",
    category: "Comfort",
    description: "Sistema de climatización automático"
  });

  vehicle.addFeature({
    name: "ABS",
    category: "Seguridad",
    description: "Sistema de frenos antibloqueo"
  });

  console.log('Características:', vehicle.features);
}

/**
 * Ejemplo 7: Cambiar estado del vehículo
 */
export function manageVehicleStatus(vehicle: Vehicle) {
  console.log('Estado inicial:', vehicle.status);

  // Marcar como disponible
  vehicle.markAsAvailable();
  console.log('Ahora disponible:', vehicle.status);

  // Actualizar precio
  vehicle.updatePrice(23000);
  console.log('Precio actualizado:', vehicle.price);

  // Marcar como reservado
  vehicle.markAsReserved();
  console.log('Reservado:', vehicle.status);

  // Marcar como vendido
  vehicle.markAsSold();
  console.log('Vendido:', vehicle.status);
}

// ========================================
// EJEMPLOS DE USO - MODEL FACTORY
// ========================================

/**
 * Ejemplo 8: Usar ModelFactory con datos de API
 */
export function useModelFactory() {
  // Simular datos que vienen de una API o base de datos
  const apiUserData = {
    id: "user-123",
    tenant_id: "tenant-abc", 
    email: "maria@example.com",
    user_type: "dealer",
    status: "active",
    created_at: "2024-01-15T10:30:00Z"
  };

  const apiVehicleData = {
    id: "vehicle-456",
    tenant_id: "tenant-abc",
    seller_id: "user-123",
    make: "Honda",
    model: "Civic",
    year: 2023,
    price: 22000,
    mileage: 5000,
    fuel_type: "gasoline",
    transmission: "manual",
    body_type: "sedan", 
    color: "Azul",
    status: "available"
  };

  // Crear modelos usando factory
  const user = ModelFactory.createUser(apiUserData);
  const vehicle = ModelFactory.createVehicle(apiVehicleData);

  console.log('Usuario desde API:', user.toString());
  console.log('Vehículo desde API:', vehicle.toString());

  // Validar los datos
  const userValidation = user.validate();
  const vehicleValidation = vehicle.validate();

  console.log('Usuario válido:', userValidation.isValid);
  console.log('Vehículo válido:', vehicleValidation.isValid);
}

/**
 * Ejemplo 9: Serialización para API
 */
export function serializeForAPI(tenant: Tenant, user: User, vehicle: Vehicle) {
  // Convertir a formato de base de datos
  const tenantForDB = tenant.toDatabase();
  const userForDB = user.toDatabase();
  const vehicleForDB = vehicle.toDatabase();

  console.log('Tenant para DB:', tenantForDB);
  console.log('User para DB:', userForDB);
  console.log('Vehicle para DB:', vehicleForDB);

  // Convertir a JSON para API
  const tenantJSON = tenant.toJSON();
  const userJSON = user.toJSON();
  const vehicleJSON = vehicle.toJSON();

  console.log('Tenant JSON:', tenantJSON);
  console.log('User JSON:', userJSON);
  console.log('Vehicle JSON:', vehicleJSON);
}

// ========================================
// FUNCIÓN PRINCIPAL DE DEMOSTRACIÓN
// ========================================

/**
 * Función principal que ejecuta todos los ejemplos
 */
export function runAllExamples() {
  console.log('=== DEMO: AutoMarket MultiTenant Models ===\n');

  // 1. Crear tenant
  console.log('1. Creando tenant...');
  const tenant = createNewTenant();

  // 2. Validar tenant inválido
  console.log('\n2. Validando tenant inválido...');
  validateTenant();

  // 3. Crear usuario
  console.log('\n3. Creando usuario...');
  const user = createNewUser(tenant.id);

  // 4. Manejar estados de usuario
  console.log('\n4. Manejando estados de usuario...');
  manageUserStates(user);

  // 5. Crear vehículo
  console.log('\n5. Creando vehículo...');
  const vehicle = createNewVehicle(tenant.id, user.id);

  // 6. Manejar detalles del vehículo
  console.log('\n6. Manejando detalles del vehículo...');
  manageVehicleDetails(vehicle);

  // 7. Cambiar estado del vehículo
  console.log('\n7. Cambiando estado del vehículo...');
  manageVehicleStatus(vehicle);

  // 8. Usar ModelFactory
  console.log('\n8. Usando ModelFactory...');
  useModelFactory();

  // 9. Serialización
  console.log('\n9. Serialización para API...');
  serializeForAPI(tenant, user, vehicle);

  console.log('\n=== FIN DE LA DEMO ===');
}

// Para ejecutar la demo, descomenta la siguiente línea:
// runAllExamples();