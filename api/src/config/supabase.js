import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Verificar si las URLs de Supabase son válidas
const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

const hasValidSupabaseConfig = 
  supabaseUrl && 
  supabaseKey && 
  supabaseAnonKey &&
  isValidUrl(supabaseUrl) &&
  supabaseUrl !== 'https://demo.supabase.co' &&
  supabaseKey !== 'demo_service_key' &&
  supabaseAnonKey !== 'demo_anon_key';

let supabase = null;
let supabasePublic = null;

if (hasValidSupabaseConfig) {
  console.log('✅ Configuración válida de Supabase detectada');
  
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.log('⚠️  Supabase no configurado - usando modo demo');
  console.log('💡 Para habilitar Supabase:');
  console.log('   1. Crea un proyecto en https://supabase.com');
  console.log('   2. Actualiza las variables SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY en .env');
}

export { supabase, supabasePublic, hasValidSupabaseConfig };