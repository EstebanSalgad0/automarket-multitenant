-- AutoMarket Multitenant Database Schema for Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 1. TENANTS TABLE
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CLP',
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Santiago',
    status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tenant for Chile
INSERT INTO tenants (name, slug, country_code, currency, timezone) 
VALUES ('AutoMarket Chile', 'chile', 'CHL', 'CLP', 'America/Santiago');

-- 2. USERS TABLE (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    user_type TEXT CHECK (user_type IN ('buyer', 'seller', 'dealer')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'suspended', 'pending_verification')) DEFAULT 'active',
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER PROFILES
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    city VARCHAR(100),
    state VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DEALER PROFILES
CREATE TABLE dealer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    business_license VARCHAR(100),
    tax_id VARCHAR(50),
    address TEXT,
    website VARCHAR(500),
    logo_url VARCHAR(500),
    inventory_size TEXT CHECK (inventory_size IN ('1-10', '11-50', '51-100', '101-500', '500+')),
    brands JSONB DEFAULT '[]',
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. VEHICLES TABLE
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    mileage INTEGER CHECK (mileage >= 0),
    condition_type TEXT CHECK (condition_type IN ('new', 'used', 'certified_pre_owned')) NOT NULL,
    body_type TEXT CHECK (body_type IN ('sedan', 'suv', 'hatchback', 'pickup', 'convertible', 'coupe', 'wagon')),
    fuel_type TEXT CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric', 'other')),
    transmission TEXT CHECK (transmission IN ('manual', 'automatic', 'cvt')),
    color VARCHAR(50),
    vin VARCHAR(17) UNIQUE,
    description TEXT,
    features JSONB DEFAULT '[]',
    status TEXT CHECK (status IN ('active', 'sold', 'reserved', 'draft', 'suspended')) DEFAULT 'active',
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    favorites_count INTEGER DEFAULT 0 CHECK (favorites_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. VEHICLE IMAGES
CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. USER CERTIFICATIONS
CREATE TABLE user_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('background_check', 'identity_verification', 'dealer_license', 'insurance_proof')) NOT NULL,
    document_url VARCHAR(500),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. USER FAVORITES
CREATE TABLE user_favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, vehicle_id)
);

-- INDEXES for better performance
CREATE INDEX idx_vehicles_tenant_id ON vehicles(tenant_id);
CREATE INDEX idx_vehicles_seller_id ON vehicles(seller_id);
CREATE INDEX idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_images_primary ON vehicle_images(vehicle_id, is_primary);
CREATE INDEX idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_vehicle_id ON user_favorites(vehicle_id);

-- TRIGGERS for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_profiles_updated_at BEFORE UPDATE ON dealer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS) Policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for multitenant isolation
-- Users can only see data from their tenant
CREATE POLICY "Users can view their tenant data" ON users FOR SELECT USING (tenant_id = (
    SELECT tenant_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());

-- Vehicles are filtered by tenant
CREATE POLICY "View vehicles from user's tenant" ON vehicles FOR SELECT USING (tenant_id = (
    SELECT tenant_id FROM users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert vehicles to their tenant" ON vehicles FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()) AND
    seller_id = auth.uid()
);

CREATE POLICY "Users can update their own vehicles" ON vehicles FOR UPDATE USING (seller_id = auth.uid());

-- Vehicle images follow vehicle permissions
CREATE POLICY "View images from accessible vehicles" ON vehicle_images FOR SELECT USING (
    vehicle_id IN (
        SELECT id FROM vehicles WHERE tenant_id = (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    )
);

-- User profiles
CREATE POLICY "View profiles from same tenant" ON user_profiles FOR SELECT USING (
    user_id IN (
        SELECT id FROM users WHERE tenant_id = (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    )
);

CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Dealer profiles
CREATE POLICY "View dealer profiles from same tenant" ON dealer_profiles FOR SELECT USING (
    user_id IN (
        SELECT id FROM users WHERE tenant_id = (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    )
);

CREATE POLICY "Dealers can update their own profile" ON dealer_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Dealers can insert their own profile" ON dealer_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Certifications
CREATE POLICY "Users can view their own certifications" ON user_certifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own certifications" ON user_certifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own certifications" ON user_certifications FOR UPDATE USING (user_id = auth.uid());

-- Favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own favorites" ON user_favorites FOR ALL USING (user_id = auth.uid());

-- Function to get current user's tenant
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
