import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import winston from 'winston';

// Importar middlewares básicos
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestLogger } from './middleware/logger.js';

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
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

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
// RUTAS DE SALUD Y ESTADO
// =====================================
app.get('/', (req, res) => {
  res.json({
    message: 'AutoMarket MultiTenant API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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
      database: 'checking...',
      redis: 'checking...'
    }
  });
});

// =====================================
// RUTAS DE DEMO
// =====================================
app.get('/api/demo', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente!',
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

// Ruta de prueba para vehículos
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
    logger.info(`🏥 Health check en http://localhost:${PORT}/health`);
    logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🎯 Demo API en http://localhost:${PORT}/api/demo`);
  });
}

export default app;