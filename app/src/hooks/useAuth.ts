import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, getCurrentTenant } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      })
    }

    getInitialSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Funciones de autenticación
  const signUp = async (
    email: string, 
    password: string, 
    userType: 'buyer' | 'seller' | 'dealer',
    profileData?: {
      firstName?: string
      lastName?: string
      phone?: string
    }
  ) => {
    try {
      console.log('🚀 Iniciando registro para:', email, 'Tipo:', userType)
      
      // 1. Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            first_name: profileData?.firstName,
            last_name: profileData?.lastName,
            tenant: getCurrentTenant()
          }
        }
      })

      if (error) {
        console.error('❌ Error en signUp:', error)
        throw error
      }

      if (data.user) {
        console.log('✅ Usuario creado en Supabase Auth:')
        console.log('  - ID:', data.user.id)
        console.log('  - Email:', data.user.email)
        console.log('  - Email confirmado:', data.user.email_confirmed_at)
        console.log('  - Confirmación requerida:', !data.user.email_confirmed_at)
        console.log('🌍 Tenant actual:', getCurrentTenant())
        
        // La creación del perfil multitenant se manejará después de la verificación del email
        console.log('📧 Se enviará email de verificación a:', email)
        console.log('ℹ️ El perfil multitenant se creará tras confirmar el email')
      }

      return { data, error: null }
    } catch (error) {
      console.error('❌ Error completo en signUp:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword
  }
}
