# 🚀 Guía de Configuración de Supabase

## 📝 Paso 1: Crear Proyecto en Supabase

### 1.1 Registro y Creación
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz click en "New Project"
4. Completa la información:
   - **Organization**: Selecciona o crea una organización
   - **Name**: `automarket-multitenant`
   - **Database Password**: Genera una contraseña segura (¡GUÁRDALA!)
   - **Region**: Selecciona la región más cercana
   - **Pricing Plan**: Free tier es suficiente para desarrollo

### 1.2 Esperar Inicialización
- El proyecto tardará ~2 minutos en estar listo
- Verás un indicador de progreso

## 🔑 Paso 2: Obtener Credenciales

### 2.1 Navegar a Settings
1. En tu proyecto, ve a **Settings** (⚙️) en el sidebar
2. Click en **API** en el menú de configuración

### 2.2 Copiar Credenciales
Encontrarás estas credenciales que necesitas:

```bash
# URL del Proyecto
Project URL: https://[tu-project-id].supabase.co

# Clave Anon (pública)
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clave de Servicio (privada - NO compartir)
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📁 Paso 3: Actualizar Variables de Entorno

### 3.1 Editar archivo .env
Abre el archivo `.env` en la raíz del proyecto y reemplaza:

```env
# SUPABASE CONFIGURATION
VITE_SUPABASE_URL=https://[tu-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DEFAULT_TENANT=chile
```

**⚠️ IMPORTANTE**: 
- Reemplaza `[tu-project-id]` con tu ID real del proyecto
- Usa la clave `anon public`, NO la `service_role`
- NO compartas estas credenciales públicamente

## 🗄️ Paso 4: Crear Base de Datos

### 4.1 Acceder al SQL Editor
1. En Supabase, ve a **SQL Editor** en el sidebar
2. Click en **New query**

### 4.2 Ejecutar Schema
1. Copia todo el contenido del archivo `supabase/setup.sql`
2. Pégalo en el editor SQL
3. Click en **Run** (▶️)

### 4.3 Verificar Creación
En **Table Editor** deberías ver las tablas:
- `tenants`
- `users` 
- `user_profiles`
- `dealer_profiles`
- `vehicles`
- `vehicle_images`
- `vehicle_features`
- `user_favorites`

## 🔐 Paso 5: Configurar Autenticación

### 5.1 Habilitar Providers
1. Ve a **Authentication** → **Providers**
2. Habilita los providers que necesites:
   - ✅ **Email** (recomendado)
   - ✅ **Google** (opcional)
   - ✅ **GitHub** (opcional)

### 5.2 Configurar Email Templates (Opcional)
1. Ve a **Authentication** → **Email Templates**
2. Personaliza los templates si es necesario

### 5.3 Configurar Redirect URLs
En **Authentication** → **URL Configuration**:
```
Site URL: http://localhost:5173
Redirect URLs: 
- http://localhost:5173
- http://localhost:5173/auth/callback
```

## 🛡️ Paso 6: Configurar Storage (Opcional)

### 6.1 Crear Bucket para Imágenes
1. Ve a **Storage**
2. Click en **Create a new bucket**
3. Nombre: `vehicle-images`
4. Marcar como **Public bucket**

### 6.2 Configurar Política de Storage
En el SQL Editor, ejecuta:

```sql
-- Política para imágenes de vehículos
CREATE POLICY "Anyone can view vehicle images" ON storage.objects
    FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Users can upload vehicle images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vehicle-images' AND 
        auth.role() = 'authenticated'
    );
```

## ✅ Paso 7: Probar Conexión

### 7.1 Reiniciar Servidor de Desarrollo
```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
cd app
npm run dev
```

### 7.2 Verificar en Consola del Navegador
1. Abre **DevTools** (F12)
2. Ve a la **Console**
3. Deberías ver logs de conexión exitosa a Supabase
4. NO deberías ver errores de "Invalid API key"

### 7.3 Probar Funcionalidad
- Navega entre las secciones del app
- Los datos de vehículos ahora vendrán de Supabase
- Puedes registrar nuevos usuarios

## 🔧 Troubleshooting

### Problema: "Invalid API key"
**Solución**: 
- Verifica que copiaste correctamente la `anon public key`
- Asegúrate de que el `.env` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo

### Problema: "Failed to fetch"
**Solución**:
- Verifica que la URL del proyecto sea correcta
- Revisa que el proyecto esté activo en Supabase
- Verifica tu conexión a internet

### Problema: "Row Level Security"
**Solución**:
- Las políticas RLS están configuradas en el schema
- Los usuarios deben estar autenticados para acceder a los datos
- Verifica que el usuario tenga un tenant asignado

### Problema: "No data showing"
**Solución**:
- Verifica que el schema se ejecutó correctamente
- Revisa que los tenants de ejemplo se crearon
- Agrega algunos vehículos de prueba

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real
1. Ve a **Logs** en Supabase
2. Selecciona **API** para ver requests
3. Selecciona **Auth** para ver autenticaciones
4. Selecciona **Database** para ver queries

### Dashboard de Métricas
- Ve a **Reports** para ver uso de la base de datos
- Monitorea requests por minuto
- Revisa errores frecuentes

## 🎯 Siguientes Pasos

Una vez conectado exitosamente:

1. **Agregar datos de prueba** más realistas
2. **Configurar upload de imágenes** a Supabase Storage  
3. **Implementar sistema de autenticación** completo
4. **Optimizar queries** para mejor rendimiento
5. **Configurar backup automático** de la base de datos

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Supabase Dashboard
2. Verifica la consola del navegador
3. Consulta la [documentación oficial](https://supabase.com/docs)
4. Revisa el [GitHub de Supabase](https://github.com/supabase/supabase)

---

✨ **¡Perfecto!** Ahora tienes una base de datos real conectada a tu aplicación multi-tenant.