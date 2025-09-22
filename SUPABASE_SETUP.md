# 🚀 Configuración de Supabase para AutoMarket Multitenant

## 📋 Pasos de Configuración

### 1. Crear Proyecto en Supabase
1. Ve a [Supabase](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL y la clave pública (anon key)

### 2. Configurar Variables de Entorno
1. Crea un archivo `.env` en la raíz del proyecto
2. Añade las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase
VITE_DEFAULT_TENANT=chile
VITE_TENANT_MODE=subdomain
```

**Ejemplo:**
```env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DEFAULT_TENANT=chile
VITE_TENANT_MODE=subdomain
```

### 3. Ejecutar Script SQL
1. Ve a tu proyecto en Supabase
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase/schema.sql`
4. Ejecuta el script haciendo clic en **Run**

### 4. Configurar Storage (Opcional)
Para imágenes de vehículos:

1. Ve a **Storage** en el panel de Supabase
2. Crea un bucket llamado `vehicle-images`
3. Configura las políticas:

```sql
-- Policy para ver imágenes (público)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');

-- Policy para subir imágenes (usuarios autenticados)
CREATE POLICY "User can upload images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'vehicle-images' AND auth.role() = 'authenticated'
);
```

### 5. Configurar Autenticación
1. Ve a **Authentication** → **Settings**
2. Configura los providers que necesites:
   - **Email**: Habilitado por defecto
   - **Google**: Opcional para login social
   - **Facebook**: Opcional para login social

3. En **Auth Settings**, configura:
   - **Site URL**: `http://localhost:5173` (desarrollo)
   - **Redirect URLs**: `http://localhost:5173/**`

### 6. Configurar RLS (Row Level Security)
El script SQL ya incluye las políticas RLS necesarias para:
- ✅ Aislamiento de datos por tenant
- ✅ Seguridad de usuarios
- ✅ Permisos granulares

## 🏗️ Estructura de la Base de Datos

### Tablas Principales
- **`tenants`**: Gestión de inquilinos (países/regiones)
- **`users`**: Usuarios del sistema (extiende auth.users)
- **`user_profiles`**: Perfiles de compradores/vendedores
- **`dealer_profiles`**: Perfiles de concesionarios
- **`vehicles`**: Catálogo de vehículos
- **`vehicle_images`**: Imágenes de vehículos
- **`user_certifications`**: Certificaciones de usuarios
- **`user_favorites`**: Favoritos de usuarios

### Características del Modelo
- 🔒 **Row Level Security (RLS)**: Aislamiento automático por tenant
- 🌍 **Multitenant**: Soporte para múltiples países/regiones
- 📱 **Real-time**: Actualizaciones en tiempo real
- 🔍 **Full-text Search**: Búsqueda avanzada de vehículos
- 📊 **Analytics**: Contadores de vistas y favoritos

## 💻 Uso en el Código

### Autenticación
```typescript
import { useAuth } from './hooks/useAuth'

function LoginComponent() {
  const { signIn, user, loading } = useAuth()
  
  const handleLogin = async () => {
    const { error } = await signIn(email, password)
    if (error) console.error('Error:', error)
  }
  
  if (loading) return <div>Cargando...</div>
  if (user) return <div>¡Bienvenido {user.email}!</div>
  
  return <button onClick={handleLogin}>Iniciar Sesión</button>
}
```

### Gestión de Vehículos
```typescript
import { vehicleService } from './services/vehicleService'

function VehiclesList() {
  const [vehicles, setVehicles] = useState([])
  
  useEffect(() => {
    const loadVehicles = async () => {
      const { vehicles, error } = await vehicleService.getVehicles({
        brand: 'Toyota',
        priceMax: 25000000
      })
      
      if (!error) setVehicles(vehicles)
    }
    
    loadVehicles()
  }, [])
  
  return (
    <div>
      {vehicles.map(vehicle => (
        <div key={vehicle.id}>
          <h3>{vehicle.brand} {vehicle.model}</h3>
          <p>${vehicle.price.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
```

## 🔧 Funciones Disponibles

### VehicleService
- `getVehicles(filters?)`: Obtener vehículos con filtros
- `getVehicleById(id)`: Obtener vehículo específico
- `createVehicle(data)`: Crear nuevo vehículo
- `updateVehicle(id, data)`: Actualizar vehículo
- `deleteVehicle(id)`: Eliminar vehículo
- `toggleFavorite(vehicleId)`: Añadir/quitar de favoritos
- `getUserFavorites()`: Obtener favoritos del usuario

### useAuth Hook
- `signUp(email, password, userType)`: Registrar usuario
- `signIn(email, password)`: Iniciar sesión
- `signOut()`: Cerrar sesión
- `resetPassword(email)`: Restablecer contraseña
- `user`: Usuario actual
- `session`: Sesión actual
- `loading`: Estado de carga

## 🌐 Configuración Multitenant

### Por Subdominio
- `chile.automarket.com` → tenant: "chile"
- `mexico.automarket.com` → tenant: "mexico"
- `colombia.automarket.com` → tenant: "colombia"

### Resolución Automática
El sistema detecta automáticamente el tenant basado en:
1. Subdominio de la URL
2. Variable de entorno `VITE_DEFAULT_TENANT` como fallback

## 🚀 Próximos Pasos

1. **Configurar tu proyecto en Supabase**
2. **Ejecutar el script SQL**
3. **Actualizar las variables de entorno**
4. **Probar la autenticación**
5. **Implementar la funcionalidad de vehículos**

## 🐛 Solución de Problemas

### Error: "Invalid JWT"
- Verifica que las variables de entorno estén correctas
- Asegúrate de que la URL y la clave coincidan con tu proyecto

### Error: "Row Level Security"
- Ejecuta el script SQL completo
- Verifica que las políticas RLS estén habilitadas

### Error: "User not found"
- El usuario debe estar registrado en la tabla `users` además de `auth.users`
- Usa el hook `useAuth` para el registro completo

---

¡Listo! Tu aplicación AutoMarket ahora está completamente integrada con Supabase 🎉
