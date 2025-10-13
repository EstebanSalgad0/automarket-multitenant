export interface Database {
  public: {
    Tables: {
      // Gestión de tenants
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          country_code: string
          currency: string
          timezone: string
          status: 'active' | 'inactive' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          country_code: string
          currency: string
          timezone: string
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          country_code?: string
          currency?: string
          timezone?: string
          status?: 'active' | 'inactive' | 'maintenance'
          updated_at?: string
        }
      }
      
      // Usuarios
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          phone?: string
          user_type: 'buyer' | 'seller' | 'dealer'
          status: 'active' | 'suspended' | 'pending_verification'
          email_verified_at?: string
          phone_verified_at?: string
          created_at: string
          updated_at: string
          // Nuevos campos agregados
          branch_id?: string
          role?: 'corporate_admin' | 'branch_manager' | 'individual_seller' | 'automotive_seller' | 'sales_person' | 'buyer'
          full_name?: string
          avatar_url?: string
          hire_date?: string
          termination_date?: string
          termination_reason?: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          phone?: string
          user_type: 'buyer' | 'seller' | 'dealer'
          status?: 'active' | 'suspended' | 'pending_verification'
          email_verified_at?: string
          phone_verified_at?: string
          created_at?: string
          updated_at?: string
          // Nuevos campos agregados
          branch_id?: string
          role?: 'corporate_admin' | 'branch_manager' | 'individual_seller' | 'automotive_seller' | 'sales_person' | 'buyer'
          full_name?: string
          avatar_url?: string
          hire_date?: string
          termination_date?: string
          termination_reason?: string
        }
        Update: {
          email?: string
          phone?: string
          user_type?: 'buyer' | 'seller' | 'dealer'
          status?: 'active' | 'suspended' | 'pending_verification'
          email_verified_at?: string
          phone_verified_at?: string
          updated_at?: string
          // Nuevos campos agregados
          branch_id?: string
          role?: 'corporate_admin' | 'branch_manager' | 'individual_seller' | 'automotive_seller' | 'sales_person' | 'buyer'
          full_name?: string
          avatar_url?: string
          hire_date?: string
          termination_date?: string
          termination_reason?: string
        }
      }

      // Perfiles de usuario
      user_profiles: {
        Row: {
          user_id: string
          tenant_id?: string
          first_name: string
          last_name: string
          phone?: string
          avatar_url?: string
          date_of_birth?: string
          gender?: 'male' | 'female' | 'other'
          city?: string
          state?: string
          rating: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          first_name: string
          last_name: string
          avatar_url?: string
          date_of_birth?: string
          gender?: 'male' | 'female' | 'other'
          city?: string
          state?: string
          rating?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          avatar_url?: string
          date_of_birth?: string
          gender?: 'male' | 'female' | 'other'
          city?: string
          state?: string
          rating?: number
          rating_count?: number
          updated_at?: string
        }
      }

      // Perfiles de dealers
      dealer_profiles: {
        Row: {
          user_id: string
          company_name: string
          business_license?: string
          tax_id?: string
          address?: string
          website?: string
          logo_url?: string
          inventory_size?: '1-10' | '11-50' | '51-100' | '101-500' | '500+'
          brands?: string[]
          verified_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          company_name: string
          business_license?: string
          tax_id?: string
          address?: string
          website?: string
          logo_url?: string
          inventory_size?: '1-10' | '11-50' | '51-100' | '101-500' | '500+'
          brands?: string[]
          verified_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          business_license?: string
          tax_id?: string
          address?: string
          website?: string
          logo_url?: string
          inventory_size?: '1-10' | '11-50' | '51-100' | '101-500' | '500+'
          brands?: string[]
          verified_at?: string
          updated_at?: string
        }
      }

      // Vehículos
      vehicles: {
        Row: {
          id: string
          tenant_id: string
          seller_id: string
          brand: string
          model: string
          year: number
          price: number
          mileage?: number
          condition_type: 'new' | 'used' | 'certified_pre_owned'
          body_type?: 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'convertible' | 'coupe' | 'wagon'
          fuel_type?: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other'
          transmission?: 'manual' | 'automatic' | 'cvt'
          color?: string
          vin?: string
          description?: string
          features?: string[]
          status: 'active' | 'sold' | 'reserved' | 'draft' | 'suspended'
          views_count: number
          favorites_count: number
          created_at: string
          updated_at: string
          // Nuevos campos agregados
          branch_id?: string
          assigned_to?: string
        }
        Insert: {
          id?: string
          tenant_id: string
          seller_id: string
          brand: string
          model: string
          year: number
          price: number
          mileage?: number
          condition_type: 'new' | 'used' | 'certified_pre_owned'
          body_type?: 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'convertible' | 'coupe' | 'wagon'
          fuel_type?: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other'
          transmission?: 'manual' | 'automatic' | 'cvt'
          color?: string
          vin?: string
          description?: string
          features?: string[]
          status?: 'active' | 'sold' | 'reserved' | 'draft' | 'suspended'
          views_count?: number
          favorites_count?: number
          created_at?: string
          updated_at?: string
          // Nuevos campos agregados
          branch_id?: string
          assigned_to?: string
        }
        Update: {
          brand?: string
          model?: string
          year?: number
          price?: number
          mileage?: number
          condition_type?: 'new' | 'used' | 'certified_pre_owned'
          body_type?: 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'convertible' | 'coupe' | 'wagon'
          fuel_type?: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other'
          transmission?: 'manual' | 'automatic' | 'cvt'
          color?: string
          vin?: string
          description?: string
          features?: string[]
          status?: 'active' | 'sold' | 'reserved' | 'draft' | 'suspended'
          views_count?: number
          favorites_count?: number
          updated_at?: string
          // Nuevos campos agregados
          branch_id?: string
          assigned_to?: string
        }
      }

      // Imágenes de vehículos
      vehicle_images: {
        Row: {
          id: string
          vehicle_id: string
          image_url: string
          alt_text?: string
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          image_url: string
          alt_text?: string
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          image_url?: string
          alt_text?: string
          sort_order?: number
          is_primary?: boolean
        }
      }

      // Certificaciones
      user_certifications: {
        Row: {
          id: string
          user_id: string
          type: 'background_check' | 'identity_verification' | 'dealer_license' | 'insurance_proof'
          document_url?: string
          verified_at?: string
          expires_at?: string
          status: 'pending' | 'approved' | 'rejected' | 'expired'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'background_check' | 'identity_verification' | 'dealer_license' | 'insurance_proof'
          document_url?: string
          verified_at?: string
          expires_at?: string
          status?: 'pending' | 'approved' | 'rejected' | 'expired'
          created_at?: string
        }
        Update: {
          document_url?: string
          verified_at?: string
          expires_at?: string
          status?: 'pending' | 'approved' | 'rejected' | 'expired'
        }
      }

      // Favoritos
      user_favorites: {
        Row: {
          user_id: string
          vehicle_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          vehicle_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }

      // Nuevas tablas agregadas
      branches: {
        Row: {
          id: string
          tenant_id: string
          name: string
          slug: string
          address?: string
          city?: string
          region?: string
          phone?: string
          email?: string
          manager_id?: string
          status: 'active' | 'inactive' | 'maintenance'
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          slug: string
          address?: string
          city?: string
          region?: string
          phone?: string
          email?: string
          manager_id?: string
          status?: 'active' | 'inactive' | 'maintenance'
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          address?: string
          city?: string
          region?: string
          phone?: string
          email?: string
          manager_id?: string
          status?: 'active' | 'inactive' | 'maintenance'
          settings?: any
          updated_at?: string
        }
      }

      leads: {
        Row: {
          id: string
          tenant_id: string
          branch_id: string
          vehicle_id: string
          assigned_to?: string
          customer_name: string
          customer_email: string
          customer_phone?: string
          message: string
          status: 'new' | 'contacted' | 'qualified' | 'lost' | 'sold'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          source?: string
          scheduled_date?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          branch_id: string
          vehicle_id: string
          assigned_to?: string
          customer_name: string
          customer_email: string
          customer_phone?: string
          message: string
          status?: 'new' | 'contacted' | 'qualified' | 'lost' | 'sold'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          source?: string
          scheduled_date?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          vehicle_id?: string
          assigned_to?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          message?: string
          status?: 'new' | 'contacted' | 'qualified' | 'lost' | 'sold'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          source?: string
          scheduled_date?: string
          notes?: string
          updated_at?: string
        }
      }

      favorites: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }

      messages: {
        Row: {
          id: string
          lead_id: string
          sender_id: string
          message: string
          message_type: 'text' | 'image' | 'document'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          sender_id: string
          message: string
          message_type?: 'text' | 'image' | 'document'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          message?: string
          message_type?: 'text' | 'image' | 'document'
          is_read?: boolean
        }
      }

      // Nuevas tablas para gestión de empleados
      employee_salaries: {
        Row: {
          id: string
          employee_id: string
          tenant_id: string
          base_salary: number
          commission_rate: number
          bonus: number
          effective_date: string
          end_date?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          tenant_id: string
          base_salary?: number
          commission_rate?: number
          bonus?: number
          effective_date?: string
          end_date?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          base_salary?: number
          commission_rate?: number
          bonus?: number
          effective_date?: string
          end_date?: string
          notes?: string
          updated_at?: string
        }
      }

      employee_action_logs: {
        Row: {
          id: string
          employee_id: string
          tenant_id: string
          action_type: 'hired' | 'fired' | 'role_changed' | 'transferred' | 'salary_updated' | 'promoted' | 'demoted'
          performed_by: string
          reason?: string
          details?: string
          previous_values?: any
          new_values?: any
          ip_address?: string
          user_agent?: string
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          tenant_id: string
          action_type: 'hired' | 'fired' | 'role_changed' | 'transferred' | 'salary_updated' | 'promoted' | 'demoted'
          performed_by: string
          reason?: string
          details?: string
          previous_values?: any
          new_values?: any
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
        Update: {
          reason?: string
          details?: string
          previous_values?: any
          new_values?: any
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_vehicle_favorites: {
        Args: {
          vehicle_id: string
          delta: number
        }
        Returns: {
          favorites_count: number
        }[]
      }
      get_current_tenant_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
