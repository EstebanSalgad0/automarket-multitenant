import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type UserRole = 'corporate_admin' | 'branch_manager' | 'sales_person' | 'buyer' | null

interface UserRoleData {
  role: UserRole
  fullName: string | null
  branchId: string | null
  loading: boolean
  error: Error | null
}

export const useUserRole = (): UserRoleData => {
  const { user } = useAuth()
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: null,
    fullName: null,
    branchId: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleData({
          role: null,
          fullName: null,
          branchId: null,
          loading: false,
          error: null
        })
        return
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role, full_name, branch_id')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user role:', error)
          setRoleData({
            role: null,
            fullName: null,
            branchId: null,
            loading: false,
            error: error as Error
          })
          return
        }

        const userData = data as any

        setRoleData({
          role: (userData?.role as UserRole) || null,
          fullName: userData?.full_name || null,
          branchId: userData?.branch_id || null,
          loading: false,
          error: null
        })

        console.log('👤 Usuario actual:', {
          email: user.email,
          role: userData?.role,
          fullName: userData?.full_name,
          branchId: userData?.branch_id
        })
      } catch (err) {
        console.error('Error en useUserRole:', err)
        setRoleData({
          role: null,
          fullName: null,
          branchId: null,
          loading: false,
          error: err as Error
        })
      }
    }

    fetchUserRole()
  }, [user])

  return roleData
}

// Helper function para obtener el nombre del rol en español
export const getRoleName = (role: UserRole): string => {
  const roleNames: Record<string, string> = {
    corporate_admin: 'Administrador Corporativo',
    branch_manager: 'Encargado de Sucursal',
    sales_person: 'Vendedor de Automotora',
    buyer: 'Comprador'
  }
  return role ? roleNames[role] || 'Sin rol' : 'Sin rol'
}

// Helper function para obtener el icono del rol
export const getRoleIcon = (role: UserRole): string => {
  const roleIcons: Record<string, string> = {
    corporate_admin: '👔',
    branch_manager: '🏢',
    sales_person: '💼',
    buyer: '🛒'
  }
  return role ? roleIcons[role] || '👤' : '👤'
}

// Helper function para obtener el color del rol
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<string, string> = {
    corporate_admin: '#8b5cf6', // Púrpura
    branch_manager: '#0ea5e9', // Azul
    sales_person: '#10b981', // Verde
    buyer: '#f59e0b' // Naranja
  }
  return role ? roleColors[role] || '#667eea' : '#667eea'
}
