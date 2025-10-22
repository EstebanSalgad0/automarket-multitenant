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
          full_name: string | null
          phone: string | null
          employee_id: string | null
          salary: number | null
          commission_rate: number | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre: string
          full_name?: string | null
          phone?: string | null
          employee_id?: string | null
          salary?: number | null
          commission_rate?: number | null
          created_at?: string
        }
        Update: {
          email?: string
          nombre?: string
          full_name?: string | null
          phone?: string | null
          employee_id?: string | null
          salary?: number | null
          commission_rate?: number | null
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
          // Compatibilidad con español y inglés
          marca: string
          brand: string
          modelo: string
          model: string
          año: number
          year: number
          precio: number
          price: number
          kilometraje: number | null
          mileage: number | null
          color: string | null
          combustible: string | null
          fuel_type: string | null
          transmision: string | null
          transmission: string | null
          descripcion: string | null
          description: string | null
          // Campos adicionales que esperan los componentes
          condition_type: 'new' | 'used' | 'certified'
          body_type: string | null
          features: string[] | null
          status: 'active' | 'sold' | 'reserved' | 'draft' | 'suspended'
          estado: 'disponible' | 'vendido' | 'reservado'
          views_count: number
          created_at: string
        }
        Insert: {
          tenant_id: string
          id?: string
          marca: string
          brand?: string
          modelo: string
          model?: string
          año: number
          year?: number
          precio: number
          price?: number
          kilometraje?: number | null
          mileage?: number | null
          color?: string | null
          combustible?: string | null
          fuel_type?: string | null
          transmision?: string | null
          transmission?: string | null
          descripcion?: string | null
          description?: string | null
          condition_type?: 'new' | 'used' | 'certified'
          body_type?: string | null
          features?: string[] | null
          status?: 'active' | 'sold' | 'reserved' | 'draft' | 'suspended'
          estado?: 'disponible' | 'vendido' | 'reservado'
          views_count?: number
          created_at?: string
        }
        Update: {
          marca?: string
          brand?: string
          modelo?: string
          model?: string
          año?: number
          year?: number
          precio?: number
          price?: number
          kilometraje?: number | null
          mileage?: number | null
          color?: string | null
          combustible?: string | null
          fuel_type?: string | null
          transmision?: string | null
          transmission?: string | null
          descripcion?: string | null
          description?: string | null
          condition_type?: 'new' | 'used' | 'certified'
          body_type?: string | null
          features?: string[] | null
          status?: 'active' | 'sold' | 'reserved' | 'draft' | 'suspended'
          estado?: 'disponible' | 'vendido' | 'reservado'
          views_count?: number
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

      // Branches - Sucursales
      branches: {
        Row: {
          id: string
          name: string
          slug: string
          address: string | null
          city: string | null
          region: string | null
          phone: string | null
          email: string | null
          status: 'active' | 'inactive' | 'maintenance'
          manager_id: string | null
          tenant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          address?: string | null
          city?: string | null
          region?: string | null
          phone?: string | null
          email?: string | null
          status?: 'active' | 'inactive' | 'maintenance'
          manager_id?: string | null
          tenant_id: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          address?: string | null
          city?: string | null
          region?: string | null
          phone?: string | null
          email?: string | null
          status?: 'active' | 'inactive' | 'maintenance'
          manager_id?: string | null
        }
      }

      // Leads - Clientes potenciales
      leads: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          message: string
          status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost'
          priority: 'low' | 'medium' | 'high'
          source: string | null
          notes: string | null
          scheduled_date: string | null
          assigned_to: string | null
          tenant_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          message: string
          status?: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost'
          priority?: 'low' | 'medium' | 'high'
          source?: string | null
          notes?: string | null
          scheduled_date?: string | null
          assigned_to?: string | null
          tenant_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          message?: string
          status?: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost'
          priority?: 'low' | 'medium' | 'high'
          source?: string | null
          notes?: string | null
          scheduled_date?: string | null
          assigned_to?: string | null
          updated_at?: string | null
        }
      }

      // Messages - Sistema de mensajería
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string | null
          subject: string
          content: string
          message: string // Alias para content
          message_type: 'inquiry' | 'response' | 'notification'
          status: 'sent' | 'delivered' | 'read'
          tenant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id?: string | null
          subject: string
          content: string
          message?: string
          message_type?: 'inquiry' | 'response' | 'notification'
          status?: 'sent' | 'delivered' | 'read'
          tenant_id: string
          created_at?: string
        }
        Update: {
          subject?: string
          content?: string
          message?: string
          message_type?: 'inquiry' | 'response' | 'notification'
          status?: 'sent' | 'delivered' | 'read'
        }
      }

      // Favorites - Favoritos de usuarios
      favorites: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          tenant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          tenant_id: string
          created_at?: string
        }
        Update: {
          // No update fields for favorites
        }
      }

      // Vehicle Posts - Publicaciones de vehículos  
      vehicle_posts: {
        Row: {
          id: string
          title: string
          description: string
          vehicle_id: string
          user_id: string
          tenant_id: string
          status: 'active' | 'inactive' | 'sold'
          featured: boolean
          views_count: number
          contacts_count: number
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          vehicle_id: string
          user_id: string
          tenant_id: string
          status?: 'active' | 'inactive' | 'sold'
          featured?: boolean
          views_count?: number
          contacts_count?: number
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          status?: 'active' | 'inactive' | 'sold'
          featured?: boolean
          views_count?: number
          contacts_count?: number
          expires_at?: string | null
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