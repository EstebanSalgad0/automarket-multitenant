/**
 * Demo rápida de los modelos de datos en la consola del navegador
 */
import { User, Vehicle, Tenant, ModelFactory, UserType, FuelType, TransmissionType, BodyType } from '../models';

// Función que se puede llamar desde la consola del navegador
(window as any).testModels = function() {
  console.log('🚀 === DEMO: AutoMarket MultiTenant Models === 🚀\n');

  // 1. Crear un Tenant
  console.log('1️⃣ Creando Tenant...');
  const tenant = Tenant.create({
    name: "AutoDealer Demo",
    country_code: "US",
    currency: "USD",
    timezone: "America/New_York"
  });
  console.log('✅ Tenant creado:', tenant.toString());
  console.log('   Slug generado:', tenant.slug);
  console.log('   ¿Está activo?', tenant.isActive());
  console.log('   ¿Abierto ahora?', tenant.isOpenNow());

  // 2. Crear un Usuario
  console.log('\n2️⃣ Creando Usuario...');
  const user = User.create({
    tenant_id: tenant.id,
    email: "demo@automarket.com",
    phone: "+1-555-123-4567",
    user_type: UserType.SELLER
  });
  console.log('✅ Usuario creado:', user.toString());
  console.log('   ¿Puede vender?', user.canSellVehicles());
  console.log('   ¿Está verificado?', user.isFullyVerified());

  // Verificar email
  user.verifyEmail();
  console.log('   ✉️ Email verificado:', user.email_verified_at);

  // 3. Crear un Vehículo
  console.log('\n3️⃣ Creando Vehículo...');
  const vehicle = Vehicle.create({
    tenant_id: tenant.id,
    seller_id: user.id,
    make: "Toyota",
    model: "Camry",
    year: 2022,
    price: 25000,
    currency: "USD",
    mileage: 15000,
    fuel_type: FuelType.GASOLINE,
    transmission: TransmissionType.AUTOMATIC,
    body_type: BodyType.SEDAN,
    color: "Blanco Perla",
    description: "Vehículo en excelente estado, único dueño, mantenimiento al día",
    location_city: "Miami",
    location_state: "FL"
  });
  
  console.log('✅ Vehículo creado:', vehicle.toString());
  console.log('   ¿Disponible?', vehicle.isAvailableForSale());
  console.log('   Depreciación:', `${vehicle.calculateDepreciation()}%`);

  // Agregar características
  vehicle.addFeature({
    name: "Aire Acondicionado",
    category: "Comfort",
    description: "Sistema dual automático"
  });
  
  vehicle.addFeature({
    name: "ABS + ESP",
    category: "Seguridad", 
    description: "Sistema de frenos antibloqueo y control de estabilidad"
  });

  console.log('   🔧 Características:', vehicle.features.map(f => f.name).join(', '));

  // Cambiar precio
  vehicle.updatePrice(23500);
  console.log('   💰 Precio actualizado a:', `$${vehicle.price.toLocaleString()}`);

  // 4. Validaciones
  console.log('\n4️⃣ Probando Validaciones...');
  
  const invalidUser = new User({
    tenant_id: "",
    email: "email-invalido",
    phone: "123",
    user_type: UserType.BUYER
  });
  
  const userValidation = invalidUser.validate();
  console.log('❌ Usuario inválido:', !userValidation.isValid);
  if (!userValidation.isValid) {
    userValidation.errors.forEach(error => {
      console.log(`   • Error en ${error.field}: ${error.message}`);
    });
  }

  // 5. Serialización
  console.log('\n5️⃣ Serialización...');
  const tenantJson = tenant.toJSON();
  const userJson = user.toJSON();
  const vehicleJson = vehicle.toJSON();
  
  console.log('📄 Tenant JSON:', tenantJson);
  console.log('👤 User JSON:', userJson);
  console.log('🚗 Vehicle JSON:', vehicleJson);

  // 6. ModelFactory
  console.log('\n6️⃣ Usando ModelFactory...');
  const mockApiData = {
    id: "api-vehicle-123",
    tenant_id: tenant.id,
    seller_id: user.id,
    make: "Honda",
    model: "Civic",
    year: 2023,
    price: 22000,
    mileage: 8000,
    fuel_type: "gasoline",
    transmission: "manual",
    body_type: "sedan",
    color: "Azul",
    status: "available",
    created_at: new Date().toISOString()
  };

  const vehicleFromFactory = ModelFactory.createVehicle(mockApiData);
  console.log('🏭 Vehículo desde Factory:', vehicleFromFactory.toString());

  console.log('\n🎉 === Demo completada exitosamente === 🎉');
  console.log('💡 Tip: Revisa las propiedades de los objetos creados en el console');
  
  return {
    tenant,
    user, 
    vehicle,
    vehicleFromFactory
  };
};

console.log('🔧 Modelos de AutoMarket cargados correctamente!');
console.log('📝 Ejecuta testModels() en la consola para ver la demo');