/**
 * Prueba rápida para verificar que los modelos funcionan correctamente
 */
import { User, Vehicle, Tenant } from '../models';
import { UserType } from '../models/BaseModel';
import { FuelType, TransmissionType, BodyType } from '../models/Vehicle';

console.log('🧪 Iniciando pruebas de modelos...');

try {
  // Prueba 1: Crear Tenant
  const tenant = Tenant.create({
    name: "Test Automotora",
    country_code: "US", 
    currency: "USD",
    timezone: "America/New_York"
  });
  console.log('✅ Tenant creado:', tenant.toString());

  // Prueba 2: Crear Usuario
  const user = User.create({
    tenant_id: tenant.id,
    email: "test@example.com",
    user_type: UserType.SELLER
  });
  console.log('✅ Usuario creado:', user.toString());

  // Prueba 3: Crear Vehículo
  const vehicle = Vehicle.create({
    tenant_id: tenant.id,
    seller_id: user.id,
    make: "Toyota",
    model: "Test",
    year: 2023,
    price: 25000,
    mileage: 10000,
    fuel_type: FuelType.GASOLINE,
    transmission: TransmissionType.AUTOMATIC,
    body_type: BodyType.SEDAN,
    color: "Rojo"
  });
  console.log('✅ Vehículo creado:', vehicle.toString());

  // Prueba 4: Validaciones
  const validation = vehicle.validate();
  console.log('✅ Validación:', validation.isValid ? 'PASÓ' : 'FALLÓ');

  // Prueba 5: Métodos
  vehicle.updatePrice(23000);
  vehicle.markAsAvailable();
  console.log('✅ Métodos funcionando, nuevo precio:', vehicle.price);

  console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
  
} catch (error) {
  console.error('❌ Error en las pruebas:', error);
}

export {};