import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, authorize, checkTenantAccess } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import redis from '../config/redis.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/{tenantId}/vehicles:
 *   get:
 *     summary: Obtener vehículos del tenant
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkTenantAccess, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite entre 1 y 100'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Precio mínimo debe ser positivo'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Precio máximo debe ser positivo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros inválidos',
        details: errors.array()
      });
    }

    const { tenantId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      brand, 
      model, 
      minPrice, 
      maxPrice,
      status = 'available',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construir query
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_images (
          id,
          image_url,
          is_primary
        )
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('status', status)
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Aplicar filtros opcionales
    if (brand) query = query.ilike('brand', `%${brand}%`);
    if (model) query = query.ilike('model', `%${model}%`);
    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);

    const { data: vehicles, error, count } = await query;

    if (error) {
      console.error('Error fetching vehicles:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener vehículos'
      });
    }

    // Formatear URLs de imágenes
    const formattedVehicles = vehicles.map(vehicle => ({
      ...vehicle,
      images: vehicle.vehicle_images.map(img => ({
        id: img.id,
        url: img.image_url,
        isPrimary: img.is_primary
      })),
      primaryImage: vehicle.vehicle_images.find(img => img.is_primary)?.image_url || null
    }));

    res.json({
      success: true,
      data: {
        vehicles: formattedVehicles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/{tenantId}/vehicles/{id}:
 *   get:
 *     summary: Obtener vehículo por ID
 *     tags: [Vehicles]
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

    // Intentar obtener de cache primero
    const cacheKey = `vehicle:${tenantId}:${id}`;
    let vehicle = await redis.get(cacheKey);

    if (!vehicle) {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_images (
            id,
            image_url,
            is_primary,
            created_at
          ),
          vehicle_features (
            id,
            feature_name,
            feature_value
          )
        `)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Vehículo no encontrado'
          });
        }
        console.error('Error fetching vehicle:', error);
        return res.status(500).json({
          success: false,
          error: 'Error al obtener vehículo'
        });
      }

      vehicle = {
        ...data,
        images: data.vehicle_images
          .sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return new Date(a.created_at) - new Date(b.created_at);
          })
          .map(img => ({
            id: img.id,
            url: img.image_url,
            isPrimary: img.is_primary
          })),
        features: data.vehicle_features.reduce((acc, feature) => {
          acc[feature.feature_name] = feature.feature_value;
          return acc;
        }, {})
      };

      // Cachear por 30 minutos
      await redis.set(cacheKey, vehicle, 1800);
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/{tenantId}/vehicles:
 *   post:
 *     summary: Crear nuevo vehículo
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               price:
 *                 type: number
 *               mileage:
 *                 type: integer
 *               fuel_type:
 *                 type: string
 *               transmission:
 *                 type: string
 *               description:
 *                 type: string
 */
router.post('/', authenticate, checkTenantAccess, authorize('automotora_admin', 'vendedor_automotora', 'vendedor_particular'), [
  body('brand').notEmpty().withMessage('Marca requerida'),
  body('model').notEmpty().withMessage('Modelo requerido'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Año válido requerido'),
  body('price').isFloat({ min: 0 }).withMessage('Precio debe ser positivo'),
  body('mileage').optional().isInt({ min: 0 }).withMessage('Kilometraje debe ser positivo'),
  body('fuel_type').optional().isIn(['gasoline', 'diesel', 'electric', 'hybrid']).withMessage('Tipo de combustible inválido'),
  body('transmission').optional().isIn(['manual', 'automatic', 'cvt']).withMessage('Transmisión inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { tenantId } = req.params;
    const vehicleData = {
      ...req.body,
      tenant_id: tenantId,
      created_by: req.user.id,
      status: 'available'
    };

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al crear vehículo'
      });
    }

    // Invalidar cache de listado
    const cachePattern = `vehicles:${tenantId}:*`;
    // Note: En producción, podrías usar Redis SCAN para encontrar y eliminar claves que coincidan

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/{tenantId}/vehicles/{id}:
 *   put:
 *     summary: Actualizar vehículo
 *     tags: [Vehicles]
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
router.put('/:id', authenticate, checkTenantAccess, authorize('automotora_admin', 'vendedor_automotora', 'vendedor_particular'), [
  body('brand').optional().notEmpty().withMessage('Marca no puede estar vacía'),
  body('model').optional().notEmpty().withMessage('Modelo no puede estar vacío'),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Año válido requerido'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Precio debe ser positivo'),
  body('status').optional().isIn(['available', 'sold', 'reserved', 'maintenance']).withMessage('Estado inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { tenantId, id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Vehículo no encontrado'
        });
      }
      console.error('Error updating vehicle:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar vehículo'
      });
    }

    // Invalidar cache del vehículo específico
    const cacheKey = `vehicle:${tenantId}:${id}`;
    await redis.del(cacheKey);

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/{tenantId}/vehicles/{id}:
 *   delete:
 *     summary: Eliminar vehículo
 *     tags: [Vehicles]
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
router.delete('/:id', authenticate, checkTenantAccess, authorize('automotora_admin'), async (req, res) => {
  try {
    const { tenantId, id } = req.params;

    // Verificar que el vehículo existe y pertenece al tenant
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (checkError || !existingVehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehículo no encontrado'
      });
    }

    // Eliminar vehículo (soft delete)
    const { error } = await supabase
      .from('vehicles')
      .update({ 
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al eliminar vehículo'
      });
    }

    // Invalidar cache
    const cacheKey = `vehicle:${tenantId}:${id}`;
    await redis.del(cacheKey);

    res.json({
      success: true,
      message: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;