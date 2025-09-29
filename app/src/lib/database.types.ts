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
        }
        Update: {
          email?: string
          phone?: string
          user_type?: 'buyer' | 'seller' | 'dealer'
          status?: 'active' | 'suspended' | 'pending_verification'
          email_verified_at?: string
          phone_verified_at?: string
          updated_at?: string
        }
      }

      // Perfiles de usuario
      user_profiles: {
        Row: {
          user_id: string
          first_name: string
          last_name: string
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
