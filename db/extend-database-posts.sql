-- =====================================================
-- EXTENSIÓN DE BASE DE DATOS - PUBLICACIONES Y ESTADÍSTICAS
-- =====================================================
-- Nuevas tablas para gestión de publicaciones y estadísticas de usuario

-- Tabla de publicaciones de vehículos
CREATE TABLE IF NOT EXISTS vehicle_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
    views_count INTEGER DEFAULT 0,
    contacts_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estadísticas de usuario
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    total_posts INTEGER DEFAULT 0,
    active_posts INTEGER DEFAULT 0,
    sold_vehicles INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_contacts INTEGER DEFAULT 0,
    total_sales_amount DECIMAL(15,2) DEFAULT 0,
    avg_sale_price DECIMAL(15,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    last_post_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actividad de usuario (log de acciones)
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50), -- 'vehicle', 'post', 'profile', etc.
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_vehicle_posts_user_id ON vehicle_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_posts_tenant_id ON vehicle_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_posts_status ON vehicle_posts(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_posts_published_at ON vehicle_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_tenant_id ON user_stats(tenant_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_tenant_id ON user_activity(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- Función para actualizar estadísticas automáticamente
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar estadísticas cuando se crea, actualiza o elimina una publicación
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        INSERT INTO user_stats (user_id, tenant_id)
        VALUES (
            CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END,
            CASE WHEN TG_OP = 'DELETE' THEN OLD.tenant_id ELSE NEW.tenant_id END
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET
            total_posts = (
                SELECT COUNT(*) 
                FROM vehicle_posts 
                WHERE user_id = user_stats.user_id
            ),
            active_posts = (
                SELECT COUNT(*) 
                FROM vehicle_posts 
                WHERE user_id = user_stats.user_id AND status = 'active'
            ),
            sold_vehicles = (
                SELECT COUNT(*) 
                FROM vehicle_posts 
                WHERE user_id = user_stats.user_id AND status = 'sold'
            ),
            total_views = (
                SELECT COALESCE(SUM(views_count), 0) 
                FROM vehicle_posts 
                WHERE user_id = user_stats.user_id
            ),
            total_contacts = (
                SELECT COALESCE(SUM(contacts_count), 0) 
                FROM vehicle_posts 
                WHERE user_id = user_stats.user_id
            ),
            last_post_date = (
                SELECT MAX(published_at) 
                FROM vehicle_posts 
                WHERE user_id = user_stats.user_id
            ),
            updated_at = NOW();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas automáticamente
DROP TRIGGER IF EXISTS trigger_update_user_stats ON vehicle_posts;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE OR DELETE ON vehicle_posts
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Trigger para updated_at en las nuevas tablas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vehicle_posts_updated_at ON vehicle_posts;
CREATE TRIGGER update_vehicle_posts_updated_at
    BEFORE UPDATE ON vehicle_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para vehicle_posts
ALTER TABLE vehicle_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view posts from their tenant" ON vehicle_posts
    FOR SELECT USING (
        tenant_id = (
            SELECT tenant_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own posts" ON vehicle_posts
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        tenant_id = (
            SELECT tenant_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own posts" ON vehicle_posts
    FOR UPDATE USING (
        user_id = auth.uid() AND
        tenant_id = (
            SELECT tenant_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own posts" ON vehicle_posts
    FOR DELETE USING (
        user_id = auth.uid() AND
        tenant_id = (
            SELECT tenant_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- RLS Policies para user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stats from their tenant" ON user_stats
    FOR SELECT USING (
        tenant_id = (
            SELECT tenant_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own stats" ON user_stats
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies para user_activity
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity from their tenant" ON user_activity
    FOR SELECT USING (
        tenant_id = (
            SELECT tenant_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "System can insert activity logs" ON user_activity
    FOR INSERT WITH CHECK (true);

-- Datos de ejemplo para vehicle_posts
INSERT INTO vehicle_posts (title, description, vehicle_id, user_id, tenant_id, views_count, contacts_count) 
SELECT 
    v.brand || ' ' || v.model || ' ' || v.year || ' - ¡Excelente Oportunidad!',
    'Vehículo en excelente estado, mantenimiento al día, único dueño. ' ||
    'Precio negociable. Disponible para prueba de manejo.',
    v.id,
    v.seller_id,
    v.tenant_id,
    FLOOR(RANDOM() * 150 + 10)::INTEGER, -- views entre 10 y 160
    FLOOR(RANDOM() * 25 + 1)::INTEGER     -- contactos entre 1 y 25
FROM vehicles v
WHERE NOT EXISTS (
    SELECT 1 FROM vehicle_posts vp WHERE vp.vehicle_id = v.id
);

-- Mensaje de confirmación
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Tablas de publicaciones y estadísticas creadas exitosamente';
    RAISE NOTICE '📊 Triggers automáticos configurados';
    RAISE NOTICE '🔒 Políticas RLS aplicadas';
    RAISE NOTICE '📝 Datos de ejemplo insertados';
END $$;