import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import redis from '../config/redis.js';

const router = express.Router();

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Obtener lista de tenants (solo para compradores)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, authorize('comprador', 'automotora_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status = 'active' } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('tenants')
      .select(`
        id,
        name,
        type,
        status,
        created_at,
        _count:vehicles(count)
      `, { count: 'exact' })
      .eq('status', status)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: tenants, error, count } = await query;

    if (error) {
      console.error('Error fetching tenants:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener tenants'
      });
    }

    res.json({
      success: true,
      data: {
        tenants,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     summary: Obtener información de un tenant específico
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userTenantId = req.user.tenantId;

    // Verificar permisos de acceso
    if (userRole !== 'comprador' && userTenantId !== id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a este tenant'
      });
    }

    // Intentar obtener de cache primero
    const cacheKey = `tenant:${id}`;
    let tenant = await redis.get(cacheKey);

    if (!tenant) {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          vehicles:vehicles(count),
          users:user_profiles(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Tenant no encontrado'
          });
        }
        console.error('Error fetching tenant:', error);
        return res.status(500).json({
          success: false,
          error: 'Error al obtener tenant'
        });
      }

      tenant = {
        ...data,
        vehicleCount: data.vehicles[0]?.count || 0,
        userCount: data.users[0]?.count || 0
      };

      // Cachear por 15 minutos
      await redis.set(cacheKey, tenant, 900);
    }

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Crear nuevo tenant (solo para automotora_admin)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [automotora, particular]
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 */
router.post('/', authenticate, authorize('automotora_admin'), async (req, res) => {
  try {
    const { name, type, description, address, phone, email } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y tipo son requeridos'
      });
    }

    const tenantData = {
      name,
      type,
      description,
      address,
      phone,
      email,
      owner_id: req.user.id,
      status: 'active'
    };

    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert(tenantData)
      .select()
      .single();

    if (error) {
      console.error('Error creating tenant:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al crear tenant'
      });
    }

    res.status(201).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/tenants/{id}:
 *   put:
 *     summary: Actualizar tenant
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, authorize('automotora_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, phone, email, status } = req.body;

    // Verificar que el usuario es owner del tenant
    const { data: existingTenant, error: checkError } = await supabase
      .from('tenants')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (checkError || !existingTenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant no encontrado'
      });
    }

    if (existingTenant.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar este tenant'
      });
    }

    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(address && { address }),
      ...(phone && { phone }),
      ...(email && { email }),
      ...(status && { status }),
      updated_at: new Date().toISOString()
    };

    const { data: tenant, error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tenant:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar tenant'
      });
    }

    // Invalidar cache
    const cacheKey = `tenant:${id}`;
    await redis.del(cacheKey);

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;