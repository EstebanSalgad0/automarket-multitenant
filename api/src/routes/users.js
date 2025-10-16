import express from 'express';
import { authenticate, authorize, checkTenantAccess } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/{tenantId}/users:
 *   get:
 *     summary: Obtener usuarios del tenant
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkTenantAccess, authorize('automotora_admin'), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { page = 1, limit = 10, role, status = 'active' } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('status', status)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener usuarios'
      });
    }

    // Ocultar información sensible
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
      lastLogin: user.last_login
    }));

    res.json({
      success: true,
      data: {
        users: safeUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/{tenantId}/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, checkTenantAccess, async (req, res) => {
  try {
    const { tenantId, id } = req.params;
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;

    // Los usuarios solo pueden ver su propio perfil, excepto admins
    if (id !== requestingUserId && requestingUserRole !== 'automotora_admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para ver este usuario'
      });
    }

    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      console.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener usuario'
      });
    }

    // Datos seguros del usuario
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      avatar: user.avatar_url
    };

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/{tenantId}/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, checkTenantAccess, async (req, res) => {
  try {
    const { tenantId, id } = req.params;
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;
    const { firstName, lastName, phone, status, role } = req.body;

    // Verificar permisos
    if (id !== requestingUserId && requestingUserRole !== 'automotora_admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar este usuario'
      });
    }

    // Solo admins pueden cambiar rol y status
    const updateData = {
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(phone && { phone }),
      updated_at: new Date().toISOString()
    };

    if (requestingUserRole === 'automotora_admin') {
      if (status) updateData.status = status;
      if (role) updateData.role = role;
    }

    const { data: user, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      console.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar usuario'
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      updatedAt: user.updated_at
    };

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/{tenantId}/users:
 *   post:
 *     summary: Invitar nuevo usuario al tenant
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, checkTenantAccess, authorize('automotora_admin'), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { email, role, firstName, lastName } = req.body;

    if (!email || !role || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, rol, nombre y apellido son requeridos'
      });
    }

    // Validar que el rol sea apropiado para el tenant
    const validRoles = ['vendedor_automotora'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido para este tenant'
      });
    }

    // Verificar que el email no esté en uso
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Este email ya está registrado'
      });
    }

    // Crear invitación en Supabase Auth
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
        tenant_id: tenantId
      },
      redirectTo: `${process.env.FRONTEND_URL}/auth/accept-invite`
    });

    if (error) {
      console.error('Error inviting user:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al enviar invitación'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: data.user.id,
        email: email,
        role: role,
        status: 'invited'
      },
      message: 'Invitación enviada exitosamente'
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;