# 🗄️ Base de Datos - AutoMarket MultiTenant

Esta carpeta contiene todos los archivos relacionados con la base de datos del sistema AutoMarket.

## 📁 Estructura

### `/migrations/` - Scripts de Migración
- **`migration_simple.sql`** - ✅ **Migración recomendada** - Script limpio y funcional
- **`migration_corporate_fixed.sql`** - ✅ Script completo con funciones avanzadas

### `/schemas/` - Esquemas Base
- **`schema.sql`** - Esquema base del sistema multi-tenant
- **`setup_ultra_safe.sql`** - Configuración de Row Level Security (RLS)
- **`panorama_bd_automarket.sql`** - Vista general de la estructura de datos

## 🚀 Instrucciones de Uso

### 1. **Configuración Inicial**
```sql
-- Ejecutar en Supabase SQL Editor
-- Usar: migration_simple.sql (recomendado)
```

### 2. **Verificación**
```sql
-- Verificar que las tablas fueron creadas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('branches', 'leads', 'favorites', 'messages');
```

### 3. **Estructura Creada**
- ✅ **branches** - Gestión de sucursales/sedes
- ✅ **leads** - Sistema de consultas de clientes
- ✅ **favorites** - Favoritos de usuarios
- ✅ **messages** - Sistema de mensajería
- ✅ **users** - Usuarios con roles corporativos
- ✅ **vehicles** - Vehículos con asignación

## 🔐 Seguridad Multi-Tenant

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Aislamiento por `tenant_id`** automático
- **Políticas granulares** por rol de usuario
- **4 Roles**: `corporate_admin`, `branch_manager`, `sales_person`, `buyer`

## 📊 Datos de Ejemplo

Las migraciones incluyen datos de ejemplo:
- **3 Sucursales** en Chile (Las Condes, Providencia, Valparaíso)
- **Usuarios con roles** asignados por tenant
- **Estructura completa** lista para desarrollo

---
**Nota**: Siempre usar `migration_simple.sql` para nuevas instalaciones.