-- ==================================================================
-- RLS POLICIES MEJORADAS PARA AUTOMARKET MULTITENANT
-- ==================================================================
-- Este archivo contiene las políticas RLS corregidas para solucionar el problema
-- de que los compradores (tenant_id = NULL) no pueden ver vehículos

-- Primero eliminamos las policies existentes problemáticas
DROP POLICY IF EXISTS "View vehicles from user's tenant" ON vehicles;
DROP POLICY IF EXISTS "View images from accessible vehicles" ON vehicle_images;
DROP POLICY IF EXISTS "View profiles from same tenant" ON user_profiles;
DROP POLICY IF EXISTS "View dealer profiles from same tenant" ON dealer_profiles;

-- ==================================================================
-- FUNCIONES HELPER MEJORADAS
-- ==================================================================

-- Función para obtener el tenant_id del usuario actual
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT tenant_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario actual es comprador
CREATE OR REPLACE FUNCTION is_current_user_buyer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COALESCE(user_type = 'buyer' OR role = 'buyer', false)
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario actual pertenece a un tenant
CREATE OR REPLACE FUNCTION user_has_tenant()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT tenant_id IS NOT NULL
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario puede acceder a un tenant específico
CREATE OR REPLACE FUNCTION can_access_tenant(target_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_tenant_id UUID;
    user_is_buyer BOOLEAN;
BEGIN
    SELECT tenant_id, (user_type = 'buyer' OR role = 'buyer') 
    INTO user_tenant_id, user_is_buyer
    FROM users WHERE id = auth.uid();
    
    -- Si es comprador (sin tenant), puede acceder a cualquier tenant
    IF user_is_buyer AND user_tenant_id IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Si tiene tenant, solo puede acceder a su propio tenant
    RETURN user_tenant_id = target_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================================
-- POLICIES PARA VEHÍCULOS (SOLUCIONADO PARA COMPRADORES)
-- ==================================================================

-- Policy principal para vehículos: Compradores ven TODOS los vehículos disponibles,
-- usuarios con tenant ven solo los de su tenant
CREATE POLICY "Enhanced_vehicles_select_policy" ON vehicles 
FOR SELECT 
USING (
    CASE 
        -- Si el usuario es comprador (sin tenant), puede ver TODOS los vehículos disponibles
        WHEN is_current_user_buyer() AND get_current_user_tenant_id() IS NULL 
        THEN status IN ('active', 'available')
        
        -- Si el usuario tiene tenant, solo ve vehículos de su tenant
        WHEN get_current_user_tenant_id() IS NOT NULL 
        THEN tenant_id = get_current_user_tenant_id()
        
        -- Por defecto, no puede ver nada
        ELSE FALSE
    END
);

-- Policy para insertar vehículos: Solo usuarios con tenant pueden insertar
CREATE POLICY "Enhanced_vehicles_insert_policy" ON vehicles 
FOR INSERT 
WITH CHECK (
    get_current_user_tenant_id() IS NOT NULL AND
    tenant_id = get_current_user_tenant_id() AND
    seller_id = auth.uid()
);

-- Policy para actualizar vehículos: Solo el propietario o admins del tenant
CREATE POLICY "Enhanced_vehicles_update_policy" ON vehicles 
FOR UPDATE 
USING (
    seller_id = auth.uid() OR 
    (
        get_current_user_tenant_id() = tenant_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('corporate_admin', 'branch_manager')
        )
    )
);

-- Policy para eliminar vehículos: Solo el propietario o admins
CREATE POLICY "Enhanced_vehicles_delete_policy" ON vehicles 
FOR DELETE 
USING (
    seller_id = auth.uid() OR 
    (
        get_current_user_tenant_id() = tenant_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('corporate_admin', 'branch_manager')
        )
    )
);

-- ==================================================================
-- POLICIES PARA IMÁGENES DE VEHÍCULOS
-- ==================================================================

-- Las imágenes siguen las mismas reglas que los vehículos
CREATE POLICY "Enhanced_vehicle_images_select_policy" ON vehicle_images 
FOR SELECT 
USING (
    vehicle_id IN (
        SELECT id FROM vehicles WHERE
        CASE 
            WHEN is_current_user_buyer() AND get_current_user_tenant_id() IS NULL 
            THEN status IN ('active', 'available')
            
            WHEN get_current_user_tenant_id() IS NOT NULL 
            THEN tenant_id = get_current_user_tenant_id()
            
            ELSE FALSE
        END
    )
);

CREATE POLICY "Enhanced_vehicle_images_insert_policy" ON vehicle_images 
FOR INSERT 
WITH CHECK (
    vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE tenant_id = get_current_user_tenant_id()
        AND seller_id = auth.uid()
    )
);

-- ==================================================================
-- POLICIES PARA PERFILES DE USUARIO
-- ==================================================================

-- Los compradores pueden ver perfiles de vendedores cuando ven sus vehículos
CREATE POLICY "Enhanced_user_profiles_select_policy" ON user_profiles 
FOR SELECT 
USING (
    -- El usuario puede ver su propio perfil
    user_id = auth.uid() OR
    
    -- Los usuarios del mismo tenant pueden verse entre sí
    (
        get_current_user_tenant_id() IS NOT NULL AND
        user_id IN (
            SELECT id FROM users 
            WHERE tenant_id = get_current_user_tenant_id()
        )
    ) OR
    
    -- Los compradores pueden ver perfiles de vendedores que tienen vehículos activos
    (
        is_current_user_buyer() AND 
        get_current_user_tenant_id() IS NULL AND
        user_id IN (
            SELECT seller_id FROM vehicles 
            WHERE status IN ('active', 'available')
        )
    )
);

-- Los usuarios solo pueden modificar su propio perfil
CREATE POLICY "Enhanced_user_profiles_modify_policy" ON user_profiles 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ==================================================================
-- POLICIES PARA PERFILES DE DEALERS
-- ==================================================================

CREATE POLICY "Enhanced_dealer_profiles_select_policy" ON dealer_profiles 
FOR SELECT 
USING (
    -- El dealer puede ver su propio perfil
    user_id = auth.uid() OR
    
    -- Usuarios del mismo tenant pueden ver perfiles de dealers
    (
        get_current_user_tenant_id() IS NOT NULL AND
        user_id IN (
            SELECT id FROM users 
            WHERE tenant_id = get_current_user_tenant_id()
        )
    ) OR
    
    -- Los compradores pueden ver perfiles de dealers que tienen vehículos activos
    (
        is_current_user_buyer() AND 
        get_current_user_tenant_id() IS NULL AND
        user_id IN (
            SELECT seller_id FROM vehicles 
            WHERE status IN ('active', 'available')
            AND seller_id IN (
                SELECT user_id FROM dealer_profiles
            )
        )
    )
);

-- Los dealers solo pueden modificar su propio perfil
CREATE POLICY "Enhanced_dealer_profiles_modify_policy" ON dealer_profiles 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ==================================================================
-- POLICIES PARA USUARIOS (TABLA PRINCIPAL)
-- ==================================================================

CREATE POLICY "Enhanced_users_select_policy" ON users 
FOR SELECT 
USING (
    -- El usuario puede ver su propio registro
    id = auth.uid() OR
    
    -- Los usuarios del mismo tenant pueden verse entre sí (para dashboards)
    (
        get_current_user_tenant_id() IS NOT NULL AND
        tenant_id = get_current_user_tenant_id()
    )
);

-- Los usuarios solo pueden actualizar su propio registro (excepto admins)
CREATE POLICY "Enhanced_users_update_policy" ON users 
FOR UPDATE 
USING (
    id = auth.uid() OR
    (
        get_current_user_tenant_id() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'corporate_admin'
            AND tenant_id = get_current_user_tenant_id()
        )
    )
);

-- ==================================================================
-- POLICIES PARA FAVORITOS
-- ==================================================================

-- Reemplazar la policy existente para soportar compradores
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;

CREATE POLICY "Enhanced_favorites_policy" ON favorites 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (
    user_id = auth.uid() AND
    vehicle_id IN (
        SELECT id FROM vehicles WHERE
        CASE 
            WHEN is_current_user_buyer() AND get_current_user_tenant_id() IS NULL 
            THEN status IN ('active', 'available')
            
            WHEN get_current_user_tenant_id() IS NOT NULL 
            THEN tenant_id = get_current_user_tenant_id()
            
            ELSE FALSE
        END
    )
);

-- ==================================================================
-- POLICIES PARA LEADS (MEJORADAS)
-- ==================================================================

-- Reemplazar policies existentes de leads
DROP POLICY IF EXISTS "View leads from same tenant" ON leads;
DROP POLICY IF EXISTS "Sales persons can manage assigned leads" ON leads;

CREATE POLICY "Enhanced_leads_select_policy" ON leads 
FOR SELECT 
USING (
    -- Los vendedores asignados pueden ver sus leads
    assigned_to = auth.uid() OR
    
    -- Los managers y admins pueden ver todos los leads de su tenant
    (
        tenant_id = get_current_user_tenant_id() AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('branch_manager', 'corporate_admin')
        )
    ) OR
    
    -- Los vendedores pueden ver leads de su sucursal
    (
        branch_id IN (
            SELECT branch_id FROM users 
            WHERE id = auth.uid() AND branch_id IS NOT NULL
        ) AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'sales_person'
        )
    )
);

CREATE POLICY "Enhanced_leads_insert_policy" ON leads 
FOR INSERT 
WITH CHECK (
    -- Solo usuarios autenticados pueden crear leads
    auth.uid() IS NOT NULL AND
    
    -- El vehículo debe ser accesible al usuario
    vehicle_id IN (
        SELECT id FROM vehicles WHERE
        CASE 
            WHEN is_current_user_buyer() AND get_current_user_tenant_id() IS NULL 
            THEN status IN ('active', 'available')
            
            WHEN get_current_user_tenant_id() IS NOT NULL 
            THEN tenant_id = get_current_user_tenant_id()
            
            ELSE FALSE
        END
    )
);

CREATE POLICY "Enhanced_leads_update_policy" ON leads 
FOR UPDATE 
USING (
    -- El vendedor asignado puede actualizar
    assigned_to = auth.uid() OR
    
    -- Los managers y admins pueden actualizar leads de su tenant
    (
        tenant_id = get_current_user_tenant_id() AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('branch_manager', 'corporate_admin')
        )
    )
);

-- ==================================================================
-- POLICIES PARA BRANCHES (SUCURSALES)
-- ==================================================================

-- Mantener las policies existentes pero mejorar la visibilidad
DROP POLICY IF EXISTS "View branches from same tenant" ON branches;
DROP POLICY IF EXISTS "Corporate admins can manage branches" ON branches;

CREATE POLICY "Enhanced_branches_select_policy" ON branches 
FOR SELECT 
USING (
    -- Usuarios del tenant pueden ver sus sucursales
    tenant_id = get_current_user_tenant_id() OR
    
    -- Los compradores pueden ver sucursales que tienen vehículos disponibles
    (
        is_current_user_buyer() AND 
        get_current_user_tenant_id() IS NULL AND
        id IN (
            SELECT DISTINCT branch_id FROM vehicles 
            WHERE status IN ('active', 'available')
            AND branch_id IS NOT NULL
        )
    )
);

CREATE POLICY "Enhanced_branches_modify_policy" ON branches 
FOR ALL 
USING (
    tenant_id = get_current_user_tenant_id() AND
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('corporate_admin', 'branch_manager')
        AND (role = 'corporate_admin' OR branch_id = branches.id)
    )
)
WITH CHECK (
    tenant_id = get_current_user_tenant_id() AND
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('corporate_admin', 'branch_manager')
    )
);

-- ==================================================================
-- POLICIES PARA MENSAJES
-- ==================================================================

-- Mejorar las policies de mensajes
DROP POLICY IF EXISTS "Users can view messages from their leads" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their leads" ON messages;

CREATE POLICY "Enhanced_messages_select_policy" ON messages 
FOR SELECT 
USING (
    -- El sender puede ver sus mensajes
    sender_id = auth.uid() OR
    
    -- Los usuarios asignados al lead pueden ver los mensajes
    lead_id IN (
        SELECT id FROM leads 
        WHERE assigned_to = auth.uid()
    ) OR
    
    -- Los managers del tenant pueden ver mensajes de leads de su tenant
    lead_id IN (
        SELECT id FROM leads 
        WHERE tenant_id = get_current_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('branch_manager', 'corporate_admin')
        )
    )
);

CREATE POLICY "Enhanced_messages_insert_policy" ON messages 
FOR INSERT 
WITH CHECK (
    sender_id = auth.uid() AND
    (
        -- El usuario está asignado al lead
        lead_id IN (
            SELECT id FROM leads 
            WHERE assigned_to = auth.uid()
        ) OR
        
        -- Es un manager que puede comunicarse
        lead_id IN (
            SELECT id FROM leads 
            WHERE tenant_id = get_current_user_tenant_id()
            AND EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND role IN ('branch_manager', 'corporate_admin')
            )
        )
    )
);

-- ==================================================================
-- GRANTS Y PERMISOS FINALES
-- ==================================================================

-- Asegurar que las funciones son accesibles
GRANT EXECUTE ON FUNCTION get_current_user_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_buyer() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_tenant() TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_tenant(UUID) TO authenticated;

-- Comentarios para documentación
COMMENT ON FUNCTION get_current_user_tenant_id() IS 'Obtiene el tenant_id del usuario autenticado actual';
COMMENT ON FUNCTION is_current_user_buyer() IS 'Verifica si el usuario actual es un comprador';
COMMENT ON FUNCTION user_has_tenant() IS 'Verifica si el usuario actual tiene un tenant asignado';
COMMENT ON FUNCTION can_access_tenant(UUID) IS 'Verifica si el usuario puede acceder a un tenant específico';

-- ==================================================================
-- NOTAS IMPORTANTES
-- ==================================================================

/*
CAMBIOS PRINCIPALES REALIZADOS:

1. PROBLEMA SOLUCIONADO: Los compradores (tenant_id = NULL) ahora pueden ver todos los vehículos disponibles
2. MULTITENANCY PRESERVADO: Los usuarios con tenant solo ven datos de su tenant
3. SEGURIDAD MEJORADA: Funciones helper para verificar permisos de forma consistente
4. FLEXIBILIDAD: Los compradores pueden ver perfiles de vendedores y sucursales relacionadas con vehículos disponibles

CASOS DE USO CUBIERTOS:
- Comprador sin tenant: Ve TODOS los vehículos disponibles + perfiles de vendedores
- Vendedor/Admin con tenant: Ve solo datos de su tenant
- Administradores: Pueden gestionar datos de su tenant
- Managers de sucursal: Pueden ver/gestionar datos de su sucursal

TESTING RECOMENDADO:
1. Login como comprador1@email.com → debe ver 19 vehículos
2. Login como admin.toyota@toyotacentro.cl → debe ver solo 5 vehículos de Toyota
3. Login como admin.premium@premiummotors.cl → debe ver solo 5 vehículos de Premium
4. Probar creación de leads desde compradores
5. Probar dashboard metrics con diferentes roles
*/