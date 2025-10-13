import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { UserRole } from '../lib/permissions'
import { auditService } from './auditService'

export interface AuthUser extends User {
  role?: UserRole
  tenant_id?: string
  branch_id?: string
  permissions?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpData {
  email: string
  password: string
  confirmPassword: string
  userType: 'customer' | 'seller' | 'dealer'
  tenantId?: string
  profileData?: {
    first_name: string
    last_name: string
    phone?: string
    company_name?: string
    [key: string]: any
  }
}

export interface SessionInfo {
  user: AuthUser | null
  session: Session | null
  isAuthenticated: boolean
  role: UserRole
  tenantId: string | null
  branchId: string | null
  lastActivity: Date | null
  expiresAt: Date | null
}

/**
 * Servicio de autenticación mejorado con seguridad robusta
 */
export class AuthService {
  private static instance: AuthService
  private sessionCheckInterval: NodeJS.Timeout | null = null
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutos
  private readonly ACTIVITY_CHECK_INTERVAL = 60 * 1000 // 1 minuto

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  constructor() {
    this.initializeSessionManagement()
  }

  /**
   * Inicializar gestión automática de sesiones
   */
  private initializeSessionManagement() {
    // Verificar sesión periódicamente
    this.sessionCheckInterval = setInterval(() => {
      this.checkSessionValidity()
    }, this.ACTIVITY_CHECK_INTERVAL)

    // Escuchar eventos de actividad del usuario
    this.setupActivityTracking()
  }

  /**
   * Configurar seguimiento de actividad del usuario
   */
  private setupActivityTracking() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    const updateLastActivity = () => {
      localStorage.setItem('lastActivity', new Date().toISOString())
    }

    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true })
    })
  }

  /**
   * Verificar validez de la sesión
   */
  private async checkSessionValidity() {
    const lastActivity = localStorage.getItem('lastActivity')
    if (!lastActivity) return

    const lastActivityTime = new Date(lastActivity).getTime()
    const now = Date.now()
    
    // Si ha pasado más tiempo del permitido sin actividad, cerrar sesión
    if (now - lastActivityTime > this.SESSION_TIMEOUT) {
      await this.logout('session_timeout')
    }
  }

  /**
   * Login con credenciales
   */
  async login(credentials: LoginCredentials): Promise<{
    user: AuthUser | null
    session: Session | null
    error: Error | null
  }> {
    try {
      // Validar formato de email
      if (!this.isValidEmail(credentials.email)) {
        throw new Error('Formato de email inválido')
      }

      // Validar fortaleza de contraseña
      if (!this.isValidPassword(credentials.password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw error

      if (data.user) {
        // Obtener información completa del usuario
        const userProfile = await this.getUserProfile(data.user.id)
        
        // Registrar login exitoso en auditoría
        await auditService.logLogin(
          data.user.id,
          credentials.email,
          userProfile?.role || UserRole.VIEWER,
          userProfile?.tenant_id || 'unknown'
        )

        // Actualizar última actividad
        localStorage.setItem('lastActivity', new Date().toISOString())
        
        // Configurar recordar sesión
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }
      }

      return {
        user: data.user as AuthUser,
        session: data.session,
        error: null
      }
    } catch (error) {
      // Registrar intento de login fallido en auditoría
      await auditService.logFailedLogin(
        credentials.email,
        (error as Error).message
      )

      return {
        user: null,
        session: null,
        error: error as Error
      }
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async signUp(signUpData: SignUpData): Promise<{
    user: AuthUser | null
    session: Session | null
    error: Error | null
  }> {
    try {
      // Validaciones
      if (!this.isValidEmail(signUpData.email)) {
        throw new Error('Formato de email inválido')
      }

      if (!this.isStrongPassword(signUpData.password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos')
      }

      if (signUpData.password !== signUpData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      // Determinar rol basado en tipo de usuario
      const role = this.mapUserTypeToRole(signUpData.userType)

      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            role,
            user_type: signUpData.userType,
            tenant_id: signUpData.tenantId || 'default',
            ...signUpData.profileData
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Registrar evento de registro
        await this.logSecurityEvent('user_registered', {
          user_id: data.user.id,
          email: signUpData.email,
          role,
          user_type: signUpData.userType,
          timestamp: new Date().toISOString()
        })
      }

      return {
        user: data.user as AuthUser,
        session: data.session,
        error: null
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as Error
      }
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(reason?: string): Promise<{ error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Obtener información del usuario para la auditoría
        const userProfile = await this.getUserProfile(user.id)
        
        // Registrar logout en auditoría
        await auditService.logLogout(
          user.id,
          user.email || 'unknown',
          reason || 'user_initiated',
          userProfile?.tenant_id || 'unknown'
        )
      }

      const { error } = await supabase.auth.signOut()
      
      // Limpiar datos locales
      localStorage.removeItem('lastActivity')
      localStorage.removeItem('rememberMe')
      
      // Limpiar interval de verificación
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval)
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  /**
   * Obtener sesión actual con información extendida
   */
  async getCurrentSession(): Promise<SessionInfo> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session || !session.user) {
      return {
        user: null,
        session: null,
        isAuthenticated: false,
        role: UserRole.VIEWER,
        tenantId: null,
        branchId: null,
        lastActivity: null,
        expiresAt: null
      }
    }

    const user = session.user as AuthUser
    const lastActivityStr = localStorage.getItem('lastActivity')
    
    return {
      user,
      session,
      isAuthenticated: true,
      role: user.user_metadata?.role || UserRole.CUSTOMER,
      tenantId: user.user_metadata?.tenant_id || null,
      branchId: user.user_metadata?.branch_id || null,
      lastActivity: lastActivityStr ? new Date(lastActivityStr) : null,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : null
    }
  }

  /**
   * Obtener perfil completo del usuario desde la base de datos
   */
  async getUserProfile(userId: string): Promise<{
    role: UserRole
    tenant_id: string
    branch_id?: string
    email: string
  } | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, tenant_id, branch_id, email')
        .eq('id', userId)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(updates: {
    email?: string
    password?: string
    metadata?: Record<string, any>
  }): Promise<{ error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { error } = await supabase.auth.updateUser(updates)
      
      if (!error && user) {
        // Registrar evento de actualización de perfil
        await this.logSecurityEvent('profile_updated', {
          user_id: user.id,
          updated_fields: Object.keys(updates),
          timestamp: new Date().toISOString()
        })
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  /**
   * Verificar fortaleza de contraseña
   */
  private isStrongPassword(password: string): boolean {
    const minLength = 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSymbol
  }

  /**
   * Validar contraseña básica
   */
  private isValidPassword(password: string): boolean {
    return password.length >= 8
  }

  /**
   * Validar formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Mapear tipo de usuario a rol
   */
  private mapUserTypeToRole(userType: string): UserRole {
    switch (userType) {
      case 'customer': return UserRole.CUSTOMER
      case 'seller': return UserRole.INDEPENDENT_SELLER
      case 'dealer': return UserRole.DEALER
      default: return UserRole.CUSTOMER
    }
  }

  /**
   * Registrar eventos de seguridad
   */
  private async logSecurityEvent(event: string, data: Record<string, any>) {
    try {
      await (supabase as any)
        .from('security_logs')
        .insert({
          event_type: event,
          event_data: data,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging security event:', error)
    }
  }



  /**
   * Limpiar recursos al destruir
   */
  destroy() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
    }
  }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance()