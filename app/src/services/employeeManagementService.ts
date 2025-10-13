import { supabase } from '../lib/supabase'

// Tipos temporales para bypass de TypeScript hasta actualizar la configuración de Supabase
const supabaseClient = supabase as any

export interface EmployeeData {
  id?: string
  email: string
  role: 'branch_manager' | 'individual_seller' | 'automotive_seller' | 'sales_person'
  branch_id?: string
  tenant_id: string
  first_name: string
  last_name: string
  phone?: string
  hire_date?: string
  salary?: number
  commission_rate?: number
  status: 'active' | 'inactive' | 'fired'
}

export interface EmployeeActionLog {
  id?: string
  employee_id: string
  action_type: 'hired' | 'fired' | 'role_changed' | 'transferred' | 'salary_updated'
  performed_by: string
  reason?: string
  details?: string
  created_at?: string
  tenant_id: string
}

export interface CreateEmployeeRequest {
  email: string
  password: string
  role: 'branch_manager' | 'individual_seller' | 'automotive_seller' | 'sales_person'
  branch_id?: string
  tenant_id: string
  first_name: string
  last_name: string
  phone?: string
  salary?: number
  commission_rate?: number
}

export interface FireEmployeeRequest {
  employee_id: string
  reason: string
  performed_by: string
  tenant_id: string
  notify_employee?: boolean
}

export class EmployeeManagementService {
  private static instance: EmployeeManagementService

  static getInstance(): EmployeeManagementService {
    if (!EmployeeManagementService.instance) {
      EmployeeManagementService.instance = new EmployeeManagementService()
    }
    return EmployeeManagementService.instance
  }

  /**
   * Crear un nuevo empleado
   */
  async createEmployee(request: CreateEmployeeRequest): Promise<{ success: boolean; employee?: any; error?: string }> {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: request.password,
        email_confirm: true,
        user_metadata: {
          first_name: request.first_name,
          last_name: request.last_name,
          role: request.role
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return { success: false, error: `Error de autenticación: ${authError.message}` }
      }

      if (!authData.user) {
        return { success: false, error: 'No se pudo crear el usuario de autenticación' }
      }

      // 2. Crear registro en tabla users
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .insert({
          id: authData.user.id,
          email: request.email,
          role: request.role,
          branch_id: request.branch_id,
          tenant_id: request.tenant_id,
          full_name: `${request.first_name} ${request.last_name}`,
          status: 'active',
          hire_date: new Date().toISOString()
        })
        .select()
        .single()

      if (userError) {
        console.error('Error creating user record:', userError)
        // Cleanup: delete auth user if user record creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: `Error creando registro de usuario: ${userError.message}` }
      }

      // 3. Crear perfil de usuario
      const { error: profileError } = await supabaseClient
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          first_name: request.first_name,
          last_name: request.last_name,
          phone: request.phone,
          tenant_id: request.tenant_id
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Note: No cleanup needed here as profile is optional
      }

      // 4. Crear registro de employee_salaries si se especifica salario
      if (request.salary || request.commission_rate) {
        const { error: salaryError } = await supabaseClient
          .from('employee_salaries')
          .insert({
            employee_id: authData.user.id,
            base_salary: request.salary || 0,
            commission_rate: request.commission_rate || 0,
            effective_date: new Date().toISOString(),
            tenant_id: request.tenant_id
          })

        if (salaryError) {
          console.error('Error creating salary record:', salaryError)
        }
      }

      // 5. Registrar acción en log de auditoría
      await this.logEmployeeAction({
        employee_id: authData.user.id,
        action_type: 'hired',
        performed_by: 'system', // Esto debería ser el ID del usuario que está creando
        details: `Empleado contratado con rol: ${request.role}`,
        tenant_id: request.tenant_id
      })

      return { 
        success: true, 
        employee: {
          ...(userData as any),
          first_name: request.first_name,
          last_name: request.last_name,
          phone: request.phone
        }
      }

    } catch (error) {
      console.error('Error in createEmployee:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Despedir un empleado
   */
  async fireEmployee(request: FireEmployeeRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Verificar que el empleado existe y está activo
      const { data: employee, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', request.employee_id)
        .eq('tenant_id', request.tenant_id)
        .single()

      if (fetchError || !employee) {
        return { success: false, error: 'Empleado no encontrado' }
      }

      if ((employee as any).status === 'fired') {
        return { success: false, error: 'El empleado ya fue despedido' }
      }

      // 2. Actualizar estado del empleado
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({
          status: 'fired',
          termination_date: new Date().toISOString(),
          termination_reason: request.reason
        })
        .eq('id', request.employee_id)
        .eq('tenant_id', request.tenant_id)

      if (updateError) {
        console.error('Error updating employee status:', updateError)
        return { success: false, error: 'Error actualizando estado del empleado' }
      }

      // 3. Desactivar acceso a vehículos (marcar como inactivos)
      const { error: vehicleError } = await supabaseClient
        .from('vehicles')
        .update({ status: 'inactive' })
        .eq('seller_id', request.employee_id)
        .eq('tenant_id', request.tenant_id)

      if (vehicleError) {
        console.error('Error deactivating employee vehicles:', vehicleError)
      }

      // 4. Registrar acción en log de auditoría
      await this.logEmployeeAction({
        employee_id: request.employee_id,
        action_type: 'fired',
        performed_by: request.performed_by,
        reason: request.reason,
        details: `Empleado despedido. Razón: ${request.reason}`,
        tenant_id: request.tenant_id
      })

      // 5. Opcional: Revocar sesiones activas del usuario
      try {
        await supabase.auth.admin.deleteUser(request.employee_id)
      } catch (authError) {
        console.error('Error revoking user sessions:', authError)
        // No fallar si no se pueden revocar las sesiones
      }

      return { success: true }

    } catch (error) {
      console.error('Error in fireEmployee:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }

  /**
   * Obtener empleados de una sucursal específica
   */
  async getBranchEmployees(branchId: string, tenantId: string): Promise<EmployeeData[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles!inner(first_name, last_name, phone),
          branches(name),
          employee_salaries(base_salary, commission_rate, effective_date)
        `)
        .eq('branch_id', branchId)
        .eq('tenant_id', tenantId)
        .neq('role', 'buyer')
        .eq('status', 'active')
        .order('hire_date', { ascending: false })

      if (error) {
        console.error('Error fetching branch employees:', error)
        return []
      }

      return data?.map((emp: any) => ({
        id: emp.id,
        email: emp.email,
        role: emp.role,
        branch_id: emp.branch_id,
        tenant_id: emp.tenant_id,
        first_name: emp.user_profiles.first_name,
        last_name: emp.user_profiles.last_name,
        phone: emp.user_profiles.phone,
        hire_date: emp.hire_date,
        salary: emp.employee_salaries?.[0]?.base_salary,
        commission_rate: emp.employee_salaries?.[0]?.commission_rate,
        status: emp.status
      })) || []

    } catch (error) {
      console.error('Error in getBranchEmployees:', error)
      return []
    }
  }

  /**
   * Obtener todos los empleados de un tenant (para admin corporativo)
   */
  async getAllTenantEmployees(tenantId: string): Promise<EmployeeData[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles!inner(first_name, last_name, phone),
          branches(name),
          employee_salaries(base_salary, commission_rate, effective_date)
        `)
        .eq('tenant_id', tenantId)
        .neq('role', 'buyer')
        .eq('status', 'active')
        .order('hire_date', { ascending: false })

      if (error) {
        console.error('Error fetching tenant employees:', error)
        return []
      }

      return data?.map((emp: any) => ({
        id: emp.id,
        email: emp.email,
        role: emp.role,
        branch_id: emp.branch_id,
        tenant_id: emp.tenant_id,
        first_name: emp.user_profiles.first_name,
        last_name: emp.user_profiles.last_name,
        phone: emp.user_profiles.phone,
        hire_date: emp.hire_date,
        salary: emp.employee_salaries?.[0]?.base_salary,
        commission_rate: emp.employee_salaries?.[0]?.commission_rate,
        status: emp.status
      })) || []

    } catch (error) {
      console.error('Error in getAllTenantEmployees:', error)
      return []
    }
  }

  /**
   * Registrar acción de empleado en log de auditoría
   */
  private async logEmployeeAction(log: EmployeeActionLog): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('employee_action_logs')
        .insert({
          employee_id: log.employee_id,
          action_type: log.action_type,
          performed_by: log.performed_by,
          reason: log.reason,
          details: log.details,
          tenant_id: log.tenant_id,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error logging employee action:', error)
      }
    } catch (error) {
      console.error('Error in logEmployeeAction:', error)
    }
  }

  /**
   * Obtener historial de acciones de un empleado
   */
  async getEmployeeActionHistory(employeeId: string, tenantId: string): Promise<EmployeeActionLog[]> {
    try {
      const { data, error } = await supabase
        .from('employee_action_logs')
        .select(`
          *,
          performed_by_user:users!performed_by(full_name, email)
        `)
        .eq('employee_id', employeeId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching employee action history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getEmployeeActionHistory:', error)
      return []
    }
  }

  /**
   * Transferir empleado a otra sucursal
   */
  async transferEmployee(employeeId: string, newBranchId: string, performedBy: string, tenantId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({ branch_id: newBranchId })
        .eq('id', employeeId)
        .eq('tenant_id', tenantId)

      if (updateError) {
        return { success: false, error: 'Error transfiriendo empleado' }
      }

      await this.logEmployeeAction({
        employee_id: employeeId,
        action_type: 'transferred',
        performed_by: performedBy,
        reason,
        details: `Empleado transferido a nueva sucursal: ${newBranchId}`,
        tenant_id: tenantId
      })

      return { success: true }
    } catch (error) {
      console.error('Error in transferEmployee:', error)
      return { success: false, error: 'Error interno del servidor' }
    }
  }
}

// Exportar instancia singleton
export const employeeManagementService = EmployeeManagementService.getInstance()