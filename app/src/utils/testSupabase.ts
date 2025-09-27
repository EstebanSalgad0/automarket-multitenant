// Test simple para verificar conexión con Supabase
import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔌 Probando conexión con Supabase...');
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Conexión exitosa!');
    console.log('📊 Datos de prueba:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// Test de autenticación
export async function testSupabaseAuth() {
  console.log('🔐 Probando autenticación...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message !== 'Auth session missing!') {
      console.error('❌ Error de auth:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Auth funcionando correctamente');
    console.log('👤 Usuario actual:', user ? `${user.email}` : 'No autenticado');
    
    return {
      success: true,
      user: user
    };
  } catch (error) {
    console.error('❌ Error inesperado en auth:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}