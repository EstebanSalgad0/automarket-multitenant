// Test de conexión a Supabase - Ejecutar después de configurar la BD
import { supabase } from '../lib/supabase';

async function testSupabaseConnection() {
  console.log('🚀 Iniciando test de conexión a Supabase...');
  
  try {
    // Test 1: Verificar conexión básica
    console.log('📡 Test 1: Conexión básica...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantsError) {
      console.error('❌ Error obteniendo tenants:', tenantsError);
      return;
    }
    
    console.log('✅ Tenants encontrados:', tenants?.length || 0);
    if (tenants && tenants.length > 0) {
      console.log('📋 Tenants disponibles:');
      tenants.forEach(tenant => {
        console.log(`  - ${tenant.name} (${tenant.slug}) - ${tenant.currency}`);
      });
    }
    
    // Test 2: Verificar vehículos
    console.log('\n🚗 Test 2: Vehículos...');
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .limit(5);
    
    if (vehiclesError) {
      console.error('❌ Error obteniendo vehículos:', vehiclesError);
      return;
    }
    
    console.log('✅ Vehículos encontrados:', vehicles?.length || 0);
    if (vehicles && vehicles.length > 0) {
      console.log('🚙 Primeros vehículos:');
      vehicles.forEach(vehicle => {
        console.log(`  - ${vehicle.make} ${vehicle.model} ${vehicle.year} - ${vehicle.price} ${vehicle.currency}`);
      });
    }
    
    // Test 3: Verificar autenticación
    console.log('\n🔐 Test 3: Estado de autenticación...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.error('❌ Error de autenticación:', authError);
    } else {
      console.log('✅ Sistema de auth funcionando');
      console.log('👤 Usuario actual:', user ? user.email : 'No autenticado (normal)');
    }
    
    console.log('\n🎉 ¡Todos los tests completados exitosamente!');
    console.log('🔗 Supabase está conectado y funcionando correctamente');
    
  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

// Ejecutar test
testSupabaseConnection();