# AutoMarket Frontend App

Frontend React para el sistema multi-tenant AutoMarket.

## 🚀 Estado Actual

La aplicación React se encuentra en desarrollo activo. Los componentes base están implementados y la estructura está preparada para conectarse con la API.

## 🛠️ Stack Tecnológico

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + Responsive Design
- **Estado**: React Hooks (useState, useEffect)
- **HTTP Client**: Fetch API (next: Axios)
- **Routing**: React Router (planificado S5)

## 📁 Estructura Actual

```
app/
├── public/
│   ├── vite.svg
│   └── logos/              # Logos de tenants
├── src/
│   ├── components/
│   │   ├── VehiclesCatalog.tsx/.css    # Catálogo principal ✅
│   │   ├── DealerRegistration.tsx/.css # Registro automotoras ✅
│   │   ├── SellerRegistration.tsx/.css # Registro vendedores ✅
│   │   └── UserProfile.tsx/.css        # Perfil usuarios ✅
│   ├── contexts/           # Contextos React (próximo)
│   ├── hooks/             # Custom hooks (próximo)
│   ├── utils/             # Utilidades (próximo)
│   ├── tenants/           # Configuración por tenant
│   │   ├── dealerships/
│   │   │   └── toyota-centro/
│   │   └── individuals/
│   ├── assets/            # Assets estáticos
│   ├── App.tsx/.css       # Componente principal
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globales
├── package.json
├── vite.config.ts
├── tsconfig*.json
└── eslint.config.js
```

## 🎨 Componentes Implementados

### VehiclesCatalog ✅
- **Funcionalidad**: Catálogo completo de vehículos
- **Características**:
  - Grid/List view responsive
  - Filtros avanzados (marca, precio, año, etc.)
  - Tarjetas de vehículos con hover effects
  - Información del vendedor
  - Diseño mobile-first

### DealerRegistration ✅ 
- **Funcionalidad**: Registro de automotoras
- **Campos**: Datos de empresa, contacto, certificaciones
- **Validación**: Campos requeridos implementados

### SellerRegistration ✅
- **Funcionalidad**: Registro de vendedores particulares  
- **Campos**: Datos personales, verificación, términos
- **UI/UX**: Formulario paso a paso

### UserProfile ✅
- **Funcionalidad**: Perfil de usuarios
- **Características**: Información personal, configuración
- **Accesibilidad**: Labels y ARIA tags implementados

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primario**: `#667eea` (azul)
- **Secundario**: `#764ba2` (púrpura)
- **Éxito**: `#10b981` (verde)
- **Advertencia**: `#f59e0b` (amarillo)
- **Error**: `#ef4444` (rojo)

### Gradientes
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
```

### Responsividad
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px+
- **Ultra-wide**: 1920px+

## 🔄 Desarrollo Próximo

### Semana 3-4: Conectividad API
- [ ] Servicio HTTP para conectar con API
- [ ] Manejo de estados de carga y error
- [ ] Integración con endpoints de vehículos
- [ ] Contexto global para tenant actual

### Semana 5: MVP Navegable
- [ ] React Router para navegación
- [ ] Autenticación de usuarios
- [ ] CRUD de vehículos funcional
- [ ] Sistema de contactos/citas
- [ ] Panel de administración por roles

### Funcionalidades Planificadas

#### Autenticación
```tsx
// Hook planificado
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  
  const login = async (email, password) => {
    // JWT authentication
  };
  
  return { user, tenant, login, logout };
};
```

#### Tenant Context
```tsx
// Contexto para manejo de tenant
const TenantContext = createContext();

const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  return (
    <TenantContext.Provider value={{ currentTenant, userRole }}>
      {children}
    </TenantContext.Provider>
  );
};
```

## 🏃‍♂️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Previsualizar build
npm run preview

# Linting
npm run lint
```

## 🐳 Docker (Próximo)

```dockerfile
# Multi-stage build planificado
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 3000
```

## 🧪 Testing (Planificado)

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: Componentes y hooks
- **Mocks**: API calls y contextos

### E2E Testing  
- **Framework**: Cypress o Playwright
- **Scenarios**: Flujos completos por tipo de usuario
- **Cross-browser**: Chrome, Firefox, Safari

## 📱 Responsive Design

### Breakpoints Implementados
```css
/* Mobile First */
@media (max-width: 479px) { /* Mobile */ }
@media (max-width: 767px) { /* Mobile Large */ }  
@media (max-width: 1023px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

### Features Responsive
- ✅ Grid adaptive (1-5 columnas según pantalla)
- ✅ Navegación colapsible en mobile
- ✅ Filtros laterales se convierten en modal
- ✅ Formularios optimizados para touch
- ✅ Imágenes responsive con lazy loading

## 🎯 Objetivos por Entrega

### S3: Base Técnica ✅
- [x] Estructura de componentes sólida
- [x] Sistema de diseño consistente  
- [x] Responsividad completa
- [x] TypeScript configuration

### S4: Conectividad 
- [ ] Integración con API
- [ ] Autenticación funcional
- [ ] Manejo de estados globales
- [ ] Autorización por roles

### S5: MVP Completo
- [ ] Navegación fluida
- [ ] CRUD completo de vehículos
- [ ] Interacciones entre usuarios
- [ ] Dashboard por tipo de usuario

## 🤝 Contribución

1. Seguir convenciones de TypeScript
2. Usar CSS Modules para estilos
3. Implementar responsive design mobile-first
4. Agregar PropTypes/TypeScript types
5. Testing unitario para nuevos componentes

## 📊 Métricas de Calidad

| Métrica | Objetivo | Actual |
|---------|----------|---------|
| TypeScript Coverage | 100% | ✅ 100% |
| Responsive Breakpoints | 5 | ✅ 5 |
| Component Tests | 80% | ⏳ 0% |
| Lighthouse Score | >90 | ⏳ TBD |
| Bundle Size | <500KB | ⏳ TBD |

---

**Estado**: 🔄 En desarrollo activo  
**Próxima milestone**: API integration (S3-S4)