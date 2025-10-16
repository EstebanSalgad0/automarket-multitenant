import { supabase } from '../config/supabase.js';

export const tenantValidator = async (req, res, next) => {
  const { tenantId } = req.params;

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: 'Tenant ID requerido'
    });
  }

  try {
    // Verificar que el tenant existe
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, status, type')
      .eq('id', tenantId)
      .single();

    if (error || !tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant no encontrado'
      });
    }

    // Verificar que el tenant está activo
    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Tenant inactivo'
      });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al validar tenant'
    });
  }
};