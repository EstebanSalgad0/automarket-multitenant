# 🚀 SETUP COMPLETO - AUTOMARKET MULTITENANT

## 📋 ¿Qué es este archivo?

**`setup-completo.sql`** es un script SQL único que configura **TODA** la base de datos del proyecto AutoMarket MultiTenant desde cero. 

## ✨ ¿Qué incluye?

### 🏗️ **Estructura Completa:**
- ✅ Extensiones PostgreSQL necesarias
- ✅ Funciones y triggers automáticos
- ✅ 5 tablas principales completamente configuradas
- ✅ Índices optimizados para rendimiento
- ✅ Constraints y validaciones de datos

### 📊 **Datos de Ejemplo Listos:**
- ✅ **3 Tenants** configurados (Toyota Centro, Premium Motors, Independientes)
- ✅ **4 Usuarios** con roles diferenciados
- ✅ **7 Vehículos** reales con datos completos
- ✅ **5 Productos** para requisitos académicos
- ✅ **Membresías** usuario-tenant configuradas

### 🎯 **Características Técnicas:**
- ✅ **Multitenant** con aislamiento completo por `tenant_id`
- ✅ **4 Roles** diferenciados con permisos granulares
- ✅ **Primary Keys compuestas** (tenant_id, id)
- ✅ **UUIDs** para identificadores únicos
- ✅ **Timestamps** automáticos con triggers
- ✅ **Validaciones** de datos robustas

---

## 🚀 CÓMO USAR

### **Opción 1: Docker (RECOMENDADO)**
```bash
# 1. Asegurar que Docker esté corriendo
docker-compose up -d database

# 2. Ejecutar el script completo
docker exec -i automarket-db psql -U automarket_user -d automarket_dev < db/setup-completo.sql
```

### **Opción 2: PostgreSQL Local**
```bash
# Si tienes PostgreSQL instalado localmente
psql -U tu_usuario -d tu_database -f db/setup-completo.sql
```

### **Opción 3: Interfaz Gráfica**
1. Abrir pgAdmin, DBeaver, o tu cliente SQL favorito
2. Conectar a la base de datos
3. Abrir el archivo `setup-completo.sql`
4. Ejecutar todo el script

---

## 📋 VERIFICACIÓN POST-INSTALACIÓN

Después de ejecutar el script, deberías ver:

```sql
-- Verificar que todo esté creado
SELECT COUNT(*) FROM tenants;     -- Debe devolver: 3
SELECT COUNT(*) FROM usuarios;    -- Debe devolver: 4  
SELECT COUNT(*) FROM vehiculos;   -- Debe devolver: 7
SELECT COUNT(*) FROM productos;   -- Debe devolver: 5
```

---

## 🎯 TENANTS CREADOS

### 1. **Toyota Centro Chile** 
- **ID:** `11111111-1111-1111-1111-111111111111`
- **Tipo:** Automotora
- **Usuarios:** Admin + Vendedor
- **Vehículos:** 3 (Corolla, RAV4, Camry)

### 2. **Premium Motors**
- **ID:** `22222222-2222-2222-2222-222222222222` 
- **Tipo:** Automotora
- **Usuarios:** Admin
- **Vehículos:** 2 (Honda Civic, VW Jetta)

### 3. **AutoVendedores Independientes**
- **ID:** `33333333-3333-3333-3333-333333333333`
- **Tipo:** Particular
- **Usuarios:** Vendedor
- **Vehículos:** 2 (Nissan Sentra, Ford Focus)

---

## 🔧 CREDENCIALES DE EJEMPLO

### Usuarios del Sistema:
```
Toyota Centro (Admin):
- Email: admin@toyotacentro.cl
- Nombre: Carlos Eduardo Martínez
- Rol: automotora_admin

Toyota Centro (Vendedor):  
- Email: vendedor@toyotacentro.cl
- Nombre: María José Silva Romero
- Rol: vendedor_automotora

Premium Motors (Admin):
- Email: admin@premiummotors.cl
- Nombre: Roberto Antonio González
- Rol: automotora_admin

AutoVendedores (Vendedor):
- Email: vendedor@autoindependientes.cl
- Nombre: Ana Patricia Morales
- Rol: vendedor_particular
```

---

## 🛠️ CARACTERÍSTICAS DEL SCRIPT

### ✅ **Seguridad:**
- Usa `ON CONFLICT DO NOTHING` para evitar duplicados
- Incluye limpieza opcional (comentada)
- Validaciones de datos con CHECK constraints

### ✅ **Optimización:**
- Índices automáticos para consultas frecuentes
- Triggers para timestamps automáticos
- Foreign keys para integridad referencial

### ✅ **Flexibilidad:**
- Se puede ejecutar múltiples veces sin errores
- Datos de ejemplo realistas
- Estructura escalable

---

## 🔄 RESET COMPLETO (SI NECESITAS)

Si necesitas limpiar y empezar de nuevo:

```sql
-- Descomenta estas líneas en el script:
DROP TABLE IF EXISTS vehicle_images CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS tenant_usuarios CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
```

---

## 📊 CONSULTAS ÚTILES

```sql
-- Ver todos los vehículos por tenant
SELECT 
    t.nombre as concesionario,
    COUNT(v.id) as total_vehiculos,
    AVG(v.precio) as precio_promedio
FROM tenants t
LEFT JOIN vehiculos v ON t.id = v.tenant_id
GROUP BY t.id, t.nombre;

-- Ver usuarios por tenant
SELECT 
    t.nombre as tenant,
    u.nombre as usuario,
    tu.rol
FROM tenants t
JOIN tenant_usuarios tu ON t.id = tu.tenant_id
JOIN usuarios u ON tu.usuario_id = u.id;

-- Ver vehículos disponibles
SELECT marca, modelo, año, precio 
FROM vehiculos 
WHERE estado = 'disponible'
ORDER BY precio DESC;
```

---

## 🎉 ¡YA ESTÁ LISTO!

Con este script tendrás:
- ✅ Base de datos completamente configurada
- ✅ Datos de ejemplo realistas
- ✅ 3 tenants funcionando
- ✅ Sistema multitenant operativo
- ✅ Listo para desarrollo y demo

**¡Tu proyecto AutoMarket MultiTenant está 100% configurado!** 🚗✨