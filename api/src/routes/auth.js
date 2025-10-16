import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import redis from '../config/redis.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres')
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

    const { email, password } = req.body;

    // Autenticar con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Obtener perfil del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        tenants (
          id,
          name,
          type,
          status
        )
      `)
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({
        success: false,
        error: 'Error al obtener perfil'
      });
    }

    // Cachear información del usuario en Redis
    const cacheKey = `user:${data.user.id}`;
    await redis.set(cacheKey, {
      id: data.user.id,
      email: data.user.email,
      role: userProfile.role,
      tenantId: userProfile.tenant_id
    }, 86400); // 24 horas

    res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userProfile.role,
          tenantId: userProfile.tenant_id,
          profile: userProfile
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [comprador, vendedor_particular, vendedor_automotora, automotora_admin]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 */
router.post('/register', [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  body('role').isIn(['comprador', 'vendedor_particular', 'vendedor_automotora', 'automotora_admin']).withMessage('Rol válido requerido'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('lastName').notEmpty().withMessage('Apellido requerido')
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

    const { email, password, role, firstName, lastName, phone } = req.body;

    // Registrar en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Si es vendedor particular, crear tenant automáticamente
    let tenantId = null;
    if (role === 'vendedor_particular') {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: `${firstName} ${lastName}`,
          type: 'particular',
          owner_id: data.user.id,
          status: 'active'
        })
        .select()
        .single();

      if (tenantError) {
        console.error('Error creating tenant:', tenantError);
      } else {
        tenantId = tenant.id;
      }
    }

    // Crear perfil de usuario
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        role: role,
        tenant_id: tenantId,
        status: 'active'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Error al crear perfil'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: email,
          role: role,
          tenantId: tenantId
        },
        message: 'Usuario registrado exitosamente. Revisa tu email para confirmar tu cuenta.'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // Invalidar token en Supabase
      await supabase.auth.signOut();
      
      // Opcional: añadir token a blacklist en Redis
      const cacheKey = `blacklist:${token}`;
      await redis.set(cacheKey, true, 86400); // 24 horas
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token requerido'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    // Intentar obtener de cache primero
    const cacheKey = `user:${user.id}`;
    let userProfile = await redis.get(cacheKey);

    if (!userProfile) {
      // Si no está en cache, obtener de base de datos
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          tenants (
            id,
            name,
            type,
            status
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        return res.status(500).json({
          success: false,
          error: 'Error al obtener perfil'
        });
      }

      userProfile = {
        id: user.id,
        email: user.email,
        role: data.role,
        tenantId: data.tenant_id,
        profile: data
      };

      // Cachear por 1 hora
      await redis.set(cacheKey, userProfile, 3600);
    }

    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;