import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import winston from 'winston';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Verificar configuración de Supabase
import { hasValidSupabaseConfig } from './config/supabase.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import tenantRoutes from './routes/tenants.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';

// Importar middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestLogger } from './middleware/logger.js';
import { tenantValidator } from './middleware/tenantValidator.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// =====================================
// CONFIGURACIÓN DE LOGGER
// =====================================
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// =====================================
// SWAGGER DOCUMENTATION
// =====================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoMarket MultiTenant API',
      version: '1.0.0',
      description: 'API para sistema de gestión vehicular multi-tenant',
      contact: {
        name: 'AutoMarket Team'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// =====================================
// MIDDLEWARES GLOBALES
// =====================================

// Seguridad básica
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // límite de requests
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Parsing y compresión
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

app.use(requestLogger);

// =====================================
// RUTAS DE DOCUMENTACIÓN
// =====================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// =====================================
// RUTAS DE SALUD Y ESTADO
// =====================================
app.get('/', (req, res) => {
  res.json({
    message: 'AutoMarket MultiTenant API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabaseConfigured: hasValidSupabaseConfig,
    mode: hasValidSupabaseConfig ? 'production' : 'demo'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    services: {
      api: 'operational',
      supabase: hasValidSupabaseConfig ? 'configured' : 'demo-mode',
      database: 'checking...',
      redis: 'checking...'
    }
  });
});

// Ruta de demo cuando Supabase no está configurado
if (!hasValidSupabaseConfig) {
  app.get('/api/demo', (req, res) => {
    res.json({
      success: true,
      message: 'API funcionando en modo demo!',
      note: 'Configura Supabase para funcionalidad completa',
      data: {
        tenants: [
          { id: 'demo', name: 'Demo Automotora', type: 'automotora' }
        ],
        vehicles: [
          {
            id: 1,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2023,
            price: 25000,
            status: 'available'
          },
          {
            id: 2,
            brand: 'Honda',
            model: 'Civic',
            year: 2022,
            price: 28000,
            status: 'available'
          }
        ]
      }
    });
  });
}

// =====================================
// RUTAS PRINCIPALES DE LA API
// =====================================
if (hasValidSupabaseConfig) {
  // Rutas completas con Supabase
  app.use('/api/auth', authRoutes);
  app.use('/api/tenants', tenantValidator, tenantRoutes);
  app.use('/api/:tenantId/vehicles', tenantValidator, vehicleRoutes);
  app.use('/api/:tenantId/users', tenantValidator, userRoutes);
  app.use('/api/:tenantId/dashboard', tenantValidator, dashboardRoutes);
} else {
  // Rutas de demo simplificadas
  app.use('/api/auth', (req, res) => {
    res.json({
      success: false,
      error: 'Autenticación no disponible en modo demo',
      message: 'Configura Supabase para habilitar autenticación'
    });
  });
  
  // Ruta de vehículos demo
  app.get('/api/:tenantId/vehicles', (req, res) => {
    const { tenantId } = req.params;
    res.json({
      success: true,
      data: {
        vehicles: [
          {
            id: 1,
            tenantId: tenantId,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2023,
            price: 25000,
            mileage: 5000,
            fuel_type: 'gasoline',
            transmission: 'automatic',
            status: 'available',
            description: 'Vehículo de demostración',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            tenantId: tenantId,
            brand: 'Honda',
            model: 'Civic',
            year: 2022,
            price: 28000,
            mileage: 8000,
            fuel_type: 'gasoline',
            transmission: 'manual',
            status: 'available',
            description: 'Otro vehículo de demostración',
            created_at: new Date().toISOString()
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10
        }
      }
    });
  });

  // Ruta de dashboard demo
  app.get('/api/:tenantId/dashboard', (req, res) => {
    res.json({
      success: true,
      data: {
        overview: {
          totalVehicles: 2,
          availableVehicles: 2,
          soldVehicles: 0,
          reservedVehicles: 0
        },
        pricing: {
          averagePrice: 26500,
          minPrice: 25000,
          maxPrice: 28000
        },
        recentVehicles: [
          {
            id: 1,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2023,
            price: 25000,
            status: 'available'
          }
        ],
        salesChart: [],
        period: '30d',
        generatedAt: new Date().toISOString()
      }
    });
  });
}

// =====================================
// MANEJO DE ERRORES
// =====================================
app.use(notFound);
app.use(errorHandler);

// =====================================
// INICIAR SERVIDOR
// =====================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
    logger.info(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
    logger.info(`🏥 Health check en http://localhost:${PORT}/health`);
    logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;