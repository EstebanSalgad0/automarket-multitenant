import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper para obtener el tenant actual (multitenant)
export const getCurrentTenant = (): string => {
  // Extraer tenant del subdominio (chile.automarket.com)
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  
  if (parts.length >= 2 && parts[0] !== 'www') {
    return parts[0]
  }
  
  // Fallback al tenant por defecto
  return import.meta.env.VITE_DEFAULT_TENANT || 'chile'
}

// Helper para queries con RLS (Row Level Security)
export const getSupabaseWithTenant = () => {
  const tenant = getCurrentTenant()
  
  return {
    supabase,
    tenant,
    // Helper para añadir filtro de tenant a queries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    withTenant: (query: any) => query.eq('tenant_id', tenant)
  }
}
