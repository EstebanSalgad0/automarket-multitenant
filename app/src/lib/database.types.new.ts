export interface Database {
  public: {
    Tables: {
      // Tenants
      tenants: {
        Row: {
          id: string
          nombre: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          created_at?: string
        }
        Update: {
          nombre?: string
        }
      }
      
      // Usuarios
      usuarios: {
        Row: {
          id: string
          email: string
          nombre: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre: string
          created_at?: string
        }
        Update: {
          email?: string
          nombre?: string
        }
      }

      // Tenant usuarios (relación many-to-many)
      tenant_usuarios: {
        Row: {
          tenant_id: string
          usuario_id: string
          rol: 'automotora_admin' | 'vendedor_automotora' | 'vendedor_particular' | 'comprador'
        }
        Insert: {
          tenant_id: string
          usuario_id: string
          rol: 'automotora_admin' | 'vendedor_automotora' | 'vendedor_particular' | 'comprador'
        }
        Update: {
          rol?: 'automotora_admin' | 'vendedor_automotora' | 'vendedor_particular' | 'comprador'
        }
      }

      // Vehículos
      vehiculos: {
        Row: {
          tenant_id: string
          id: string
          marca: string
          modelo: string
          año: number
          precio: number
          kilometraje: number | null
          color: string | null
          combustible: string | null
          transmision: string | null
          descripcion: string | null
          estado: 'disponible' | 'vendido' | 'reservado'
          created_at: string
        }
        Insert: {
          tenant_id: string
          id?: string
          marca: string
          modelo: string
          año: number
          precio: number
          kilometraje?: number | null
          color?: string | null
          combustible?: string | null
          transmision?: string | null
          descripcion?: string | null
          estado?: 'disponible' | 'vendido' | 'reservado'
          created_at?: string
        }
        Update: {
          marca?: string
          modelo?: string
          año?: number
          precio?: number
          kilometraje?: number | null
          color?: string | null
          combustible?: string | null
          transmision?: string | null
          descripcion?: string | null
          estado?: 'disponible' | 'vendido' | 'reservado'
        }
      }

      // Productos (tabla de ejemplo)
      productos: {
        Row: {
          tenant_id: string
          id: string
          nombre: string
          precio: number
          stock: number
          created_at: string
        }
        Insert: {
          tenant_id: string
          id?: string
          nombre: string
          precio: number
          stock: number
          created_at?: string
        }
        Update: {
          nombre?: string
          precio?: number
          stock?: number
        }
      }

      // Logs de auditoría
      audit_logs: {
        Row: {
          id: string
          user_id: string
          user_email: string | null
          user_role: string | null
          tenant_id: string
          event_type: string
          resource_type: string
          resource_id: string | null
          action: string
          description: string
          ip_address: string | null
          user_agent: string | null
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email?: string | null
          user_role?: string | null
          tenant_id: string
          event_type: string
          resource_type: string
          resource_id?: string | null
          action: string
          description: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: any | null
          created_at?: string
        }
        Update: {
          user_email?: string | null
          user_role?: string | null
          event_type?: string
          resource_type?: string
          resource_id?: string | null
          action?: string
          description?: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: any | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}