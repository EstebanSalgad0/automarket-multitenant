import jwt from 'jsonwebtoken';
import { supabase, hasValidSupabaseConfig } from '../config/supabase.js';

export const authenticate = async (req, res, next) => {
  try {
    // En modo demo, crear usuario ficticio
    if (!hasValidSupabaseConfig) {
      req.user = {
        id: 'demo-user-123',
        email: 'demo@automarket.com',
        role: 'automotora_admin',
        tenantId: 'demo',
        profile: {
          id: 'demo-user-123',
          first_name: 'Usuario',
          last_name: 'Demo',
          role: 'automotora_admin',
          tenant_id: 'demo'
        }
      };
      console.log('🎭 Modo demo: usando usuario ficticio');
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    // Obtener información adicional del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(401).json({
        success: false,
        error: 'Error al obtener perfil de usuario'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: userProfile.role,
      tenantId: userProfile.tenant_id,
      profile: userProfile
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Error de autenticación'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

export const checkTenantAccess = (req, res, next) => {
  const { tenantId } = req.params;
  const userTenantId = req.user.tenantId;
  const userRole = req.user.role;

  // Los compradores pueden acceder a cualquier tenant (solo lectura)
  if (userRole === 'comprador') {
    return next();
  }

  // Los demás usuarios solo pueden acceder a su propio tenant
  if (tenantId !== userTenantId) {
    return res.status(403).json({
      success: false,
      error: 'No tienes acceso a este tenant'
    });
  }

  next();
};