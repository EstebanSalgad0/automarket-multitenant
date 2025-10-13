-- Migración para agregar funcionalidad de gestión de empleados
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. EMPLOYEE SALARIES TABLE
-- Tabla para almacenar información de salarios y comisiones de empleados
CREATE TABLE IF NOT EXISTS employee_salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    base_salary DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (base_salary >= 0),
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    bonus DECIMAL(12,2) DEFAULT 0 CHECK (bonus >= 0),
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EMPLOYEE ACTION LOGS TABLE
-- Tabla para auditoría de acciones realizadas sobre empleados
CREATE TABLE IF NOT EXISTS employee_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('hired', 'fired', 'role_changed', 'transferred', 'salary_updated', 'promoted', 'demoted')),
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    details TEXT,
    previous_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agregar campos adicionales a la tabla users para gestión de empleados
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS termination_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS termination_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT GENERATED ALWAYS AS (
    COALESCE(
        (SELECT first_name || ' ' || last_name FROM user_profiles WHERE user_id = users.id),
        email
    )
) STORED;

-- Actualizar el check constraint de role para incluir todos los roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('corporate_admin', 'branch_manager', 'individual_seller', 'automotive_seller', 'sales_person', 'buyer'));

-- 4. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_employee_salaries_employee_tenant ON employee_salaries(employee_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_effective_date ON employee_salaries(effective_date);
CREATE INDEX IF NOT EXISTS idx_employee_action_logs_employee ON employee_action_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_action_logs_tenant ON employee_action_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_action_logs_action_type ON employee_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_employee_action_logs_performed_by ON employee_action_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_employee_action_logs_created_at ON employee_action_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_hire_date ON users(hire_date);
CREATE INDEX IF NOT EXISTS idx_users_status_role ON users(status, role);

-- 5. Configurar Row Level Security (RLS)

-- Employee Salaries RLS
ALTER TABLE employee_salaries ENABLE ROW LEVEL SECURITY;

-- Los administradores corporativos pueden ver todos los salarios de su tenant
CREATE POLICY "Corporate admins can view all salaries" ON employee_salaries FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.tenant_id = employee_salaries.tenant_id 
        AND users.role = 'corporate_admin'
        AND users.status = 'active'
    )
);

-- Los jefes de sucursal pueden ver salarios de empleados de su sucursal
CREATE POLICY "Branch managers can view branch salaries" ON employee_salaries FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u1
        JOIN users u2 ON u2.id = employee_salaries.employee_id
        WHERE u1.id = auth.uid() 
        AND u1.tenant_id = employee_salaries.tenant_id 
        AND u1.role = 'branch_manager'
        AND u1.status = 'active'
        AND u1.branch_id = u2.branch_id
    )
);

-- Los empleados pueden ver solo sus propios salarios
CREATE POLICY "Employees can view own salary" ON employee_salaries FOR SELECT USING (
    employee_id = auth.uid()
);

-- Solo los administradores corporativos pueden insertar/actualizar salarios
CREATE POLICY "Corporate admins can manage salaries" ON employee_salaries 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.tenant_id = employee_salaries.tenant_id 
        AND users.role = 'corporate_admin'
        AND users.status = 'active'
    )
);

-- Employee Action Logs RLS
ALTER TABLE employee_action_logs ENABLE ROW LEVEL SECURITY;

-- Los administradores corporativos pueden ver todos los logs de su tenant
CREATE POLICY "Corporate admins can view all action logs" ON employee_action_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.tenant_id = employee_action_logs.tenant_id 
        AND users.role = 'corporate_admin'
        AND users.status = 'active'
    )
);

-- Los jefes de sucursal pueden ver logs de empleados de su sucursal
CREATE POLICY "Branch managers can view branch action logs" ON employee_action_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u1
        JOIN users u2 ON u2.id = employee_action_logs.employee_id
        WHERE u1.id = auth.uid() 
        AND u1.tenant_id = employee_action_logs.tenant_id 
        AND u1.role = 'branch_manager'
        AND u1.status = 'active'
        AND u1.branch_id = u2.branch_id
    )
);

-- Los empleados pueden ver solo sus propios logs
CREATE POLICY "Employees can view own action logs" ON employee_action_logs FOR SELECT USING (
    employee_id = auth.uid()
);

-- Solo los administradores y jefes de sucursal pueden insertar logs
CREATE POLICY "Admins and managers can create action logs" ON employee_action_logs FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.tenant_id = employee_action_logs.tenant_id 
        AND users.role IN ('corporate_admin', 'branch_manager')
        AND users.status = 'active'
    )
);

-- 6. Crear funciones de utilidad

-- Función para obtener el salario actual de un empleado
CREATE OR REPLACE FUNCTION get_current_salary(employee_uuid UUID)
RETURNS TABLE(base_salary DECIMAL, commission_rate DECIMAL, effective_date TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        es.base_salary,
        es.commission_rate,
        es.effective_date
    FROM employee_salaries es
    WHERE es.employee_id = employee_uuid
    AND (es.end_date IS NULL OR es.end_date > NOW())
    ORDER BY es.effective_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar acciones de empleados automáticamente
CREATE OR REPLACE FUNCTION log_employee_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar para cambios relevantes
    IF TG_OP = 'UPDATE' THEN
        -- Registrar cambios de rol
        IF OLD.role != NEW.role THEN
            INSERT INTO employee_action_logs (
                employee_id, tenant_id, action_type, performed_by, 
                details, previous_values, new_values
            ) VALUES (
                NEW.id, NEW.tenant_id, 'role_changed', auth.uid(),
                'Role changed from ' || OLD.role || ' to ' || NEW.role,
                jsonb_build_object('role', OLD.role),
                jsonb_build_object('role', NEW.role)
            );
        END IF;
        
        -- Registrar cambios de sucursal
        IF COALESCE(OLD.branch_id::text, '') != COALESCE(NEW.branch_id::text, '') THEN
            INSERT INTO employee_action_logs (
                employee_id, tenant_id, action_type, performed_by,
                details, previous_values, new_values
            ) VALUES (
                NEW.id, NEW.tenant_id, 'transferred', auth.uid(),
                'Transferred between branches',
                jsonb_build_object('branch_id', OLD.branch_id),
                jsonb_build_object('branch_id', NEW.branch_id)
            );
        END IF;
        
        -- Registrar despidos
        IF OLD.status != 'fired' AND NEW.status = 'fired' THEN
            INSERT INTO employee_action_logs (
                employee_id, tenant_id, action_type, performed_by,
                details, reason
            ) VALUES (
                NEW.id, NEW.tenant_id, 'fired', auth.uid(),
                'Employee terminated',
                NEW.termination_reason
            );
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para logging automático
DROP TRIGGER IF EXISTS employee_action_logging_trigger ON users;
CREATE TRIGGER employee_action_logging_trigger
    AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION log_employee_action();

-- 7. Insertar algunos datos de ejemplo para testing (opcional)
-- Agregar salarios para usuarios existentes
INSERT INTO employee_salaries (employee_id, tenant_id, base_salary, commission_rate, effective_date)
SELECT 
    u.id,
    u.tenant_id,
    CASE 
        WHEN u.role = 'corporate_admin' THEN 1500000
        WHEN u.role = 'branch_manager' THEN 1200000
        WHEN u.role = 'automotive_seller' THEN 800000
        WHEN u.role = 'individual_seller' THEN 600000
        WHEN u.role = 'sales_person' THEN 500000
        ELSE 0
    END as base_salary,
    CASE 
        WHEN u.role IN ('automotive_seller', 'individual_seller', 'sales_person') THEN 2.5
        ELSE 0
    END as commission_rate,
    COALESCE(u.hire_date, u.created_at) as effective_date
FROM users u
WHERE u.role != 'buyer' 
AND u.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM employee_salaries es 
    WHERE es.employee_id = u.id
)
ON CONFLICT DO NOTHING;

-- 8. Comentarios y documentación
COMMENT ON TABLE employee_salaries IS 'Almacena información de salarios y comisiones de empleados';
COMMENT ON TABLE employee_action_logs IS 'Registro de auditoría para todas las acciones realizadas sobre empleados';
COMMENT ON COLUMN employee_action_logs.action_type IS 'Tipo de acción: hired, fired, role_changed, transferred, salary_updated, promoted, demoted';
COMMENT ON COLUMN employee_action_logs.performed_by IS 'Usuario que realizó la acción';
COMMENT ON COLUMN employee_action_logs.previous_values IS 'Valores anteriores en formato JSON';
COMMENT ON COLUMN employee_action_logs.new_values IS 'Nuevos valores en formato JSON';

-- Confirmar que la migración se ejecutó correctamente
SELECT 'Employee management tables created successfully!' as status;