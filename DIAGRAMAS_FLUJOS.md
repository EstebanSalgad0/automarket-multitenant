# Diagramas de Flujos de Trabajo - Automarket Multitenant

## 17. Flujo de Registro de Usuario

```mermaid
flowchart TD
    A[Usuario accede al sitio] --> B{¿Tiene cuenta?}
    B -->|No| C[Clic en Registrarse]
    B -->|Sí| D[Login]
    
    C --> E{¿Tipo de usuario?}
    E -->|Comprador| F[Formulario Comprador]
    E -->|Vendedor| G[Formulario Vendedor]
    E -->|Concesionario| H[Formulario Dealer]
    
    F --> I[Validar datos básicos]
    G --> I
    H --> J[Validar datos empresa]
    
    I --> K{¿Datos válidos?}
    J --> L{¿Datos válidos?}
    
    K -->|No| M[Mostrar errores]
    L -->|No| M
    M --> F
    M --> G
    M --> H
    
    K -->|Sí| N[Crear usuario en Supabase]
    L -->|Sí| N
    
    N --> O{¿Creación exitosa?}
    O -->|No| P[Error de registro]
    O -->|Sí| Q[Enviar email verificación]
    
    Q --> R[Mostrar mensaje confirmación]
    R --> S[Redirigir a login]
    
    D --> T[Verificar credenciales]
    T --> U{¿Credenciales válidas?}
    U -->|No| V[Error de login]
    U -->|Sí| W[Obtener datos usuario]
    W --> X[Establecer sesión]
    X --> Y[Redirigir a dashboard]
```

## 18. Flujo de Publicación de Vehículo

```mermaid
flowchart TD
    A[Vendedor logueado] --> B[Clic Publicar Vehículo]
    B --> C[Verificar permisos]
    C --> D{¿Es vendedor/dealer?}
    
    D -->|No| E[Mensaje: Upgrade cuenta]
    D -->|Sí| F[Mostrar formulario]
    
    F --> G[Llenar datos básicos]
    G --> H[Seleccionar marca/modelo]
    H --> I[Ingresar precio/millaje]
    I --> J[Agregar descripción]
    J --> K[Subir imágenes]
    
    K --> L{¿Imágenes válidas?}
    L -->|No| M[Error formato/tamaño]
    M --> K
    
    L -->|Sí| N[Validar formulario]
    N --> O{¿Datos completos?}
    
    O -->|No| P[Resaltar campos faltantes]
    P --> G
    
    O -->|Sí| Q[Crear modelo Vehicle]
    Q --> R[Validar modelo]
    R --> S{¿Validación OK?}
    
    S -->|No| T[Mostrar errores validación]
    T --> G
    
    S -->|Sí| U[Guardar en base de datos]
    U --> V{¿Guardado exitoso?}
    
    V -->|No| W[Error al guardar]
    V -->|Sí| X[Procesar imágenes]
    X --> Y[Generar thumbnails]
    Y --> Z[Indexar para búsqueda]
    Z --> AA[Notificar éxito]
    AA --> BB[Redirigir a mis vehículos]
```

## 19. Flujo de Búsqueda de Vehículos

```mermaid
flowchart TD
    A[Usuario en catálogo] --> B[Aplicar filtros]
    B --> C{¿Filtros válidos?}
    
    C -->|No| D[Resetear filtros]
    D --> B
    
    C -->|Sí| E[Construir query]
    E --> F[Llamar vehicleService.getVehicles]
    F --> G[Aplicar filtros tenant]
    G --> H[Ejecutar búsqueda]
    
    H --> I{¿Hay resultados?}
    I -->|No| J[Mostrar mensaje sin resultados]
    I -->|Sí| K[Convertir a modelos Vehicle]
    
    K --> L[Aplicar ordenamiento]
    L --> M[Aplicar paginación]
    M --> N[Cargar imágenes principales]
    N --> O[Renderizar tarjetas]
    
    O --> P[Usuario navega]
    P --> Q{¿Acción del usuario?}
    
    Q -->|Ver detalles| R[Ir a página detalle]
    Q -->|Cambiar página| S[Cargar página siguiente]
    Q -->|Nuevos filtros| B
    Q -->|Favorito| T[Toggle favorito]
    
    R --> U[Incrementar contador vistas]
    S --> F
    T --> V[Actualizar estado favoritos]
    V --> O
```

## 20. Flujo de Autenticación Multi-Tenant

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant S as Supabase
    participant D as Database
    
    U->>F: Accede a subdomain (chile.automarket.com)
    F->>F: Extraer tenant del hostname
    F->>F: Establecer tenant_id = 'chile'
    
    U->>F: Intento de login
    F->>S: auth.signInWithPassword(email, password)
    S->>D: Verificar credenciales
    D->>S: Usuario válido
    S->>F: JWT token + user data
    
    F->>F: Verificar tenant_id en user data
    F->>F: Establecer contexto tenant
    
    Note over F: Todas las queries incluyen tenant_id = 'chile'
    
    U->>F: Solicita vehículos
    F->>S: query.eq('tenant_id', 'chile')
    S->>D: SELECT * FROM vehicles WHERE tenant_id = 'chile'
    D->>S: Resultados filtrados por tenant
    S->>F: Solo vehículos de Chile
    F->>U: Mostrar vehículos
```

## 21. Flujo de Validación de Modelos

```mermaid
flowchart TD
    A[Crear instancia modelo] --> B[Constructor BaseModel]
    B --> C[Generar UUID si no existe]
    C --> D[Establecer timestamps]
    D --> E[Asignar propiedades específicas]
    
    E --> F[Llamar validate()]
    F --> G[Validar campos obligatorios]
    G --> H[Validar tipos de datos]
    H --> I[Validar reglas de negocio]
    
    I --> J{¿Todas las validaciones OK?}
    J -->|No| K[Recopilar errores]
    K --> L[Retornar ValidationResult con errores]
    
    J -->|Sí| M[Retornar ValidationResult success]
    
    subgraph "Validaciones Específicas"
        N[User: Email format, phone format]
        O[Vehicle: Year range, price > 0, mileage >= 0]
        P[Tenant: Country code, currency, timezone]
    end
    
    I --> N
    I --> O  
    I --> P
```

## 22. Flujo de Manejo de Errores

```mermaid
flowchart TD
    A[Operación iniciada] --> B{¿Tipo de error?}
    
    B -->|Validación| C[ValidationError]
    B -->|Red/API| D[NetworkError]
    B -->|Autorización| E[AuthError]
    B -->|Base de datos| F[DatabaseError]
    B -->|Desconocido| G[GenericError]
    
    C --> H[Mostrar errores en formulario]
    D --> I[Mostrar toast error conectividad]
    E --> J[Redirigir a login]
    F --> K[Log error + toast genérico]
    G --> K
    
    H --> L[Usuario corrige datos]
    I --> M[Retry automático]
    J --> N[Usuario se re-autentica]
    K --> O[Reportar a monitoring]
    
    L --> P[Reintentar operación]
    M --> P
    N --> P
    O --> P
    
    P --> Q{¿Éxito?}
    Q -->|Sí| R[Continuar flujo normal]
    Q -->|No| S[Escalación error]
    
    S --> T[Log detallado]
    T --> U[Notificación admin]
    U --> V[Fallback UI]
```

## 23. Flujo de Optimización de Imágenes

```mermaid
flowchart TD
    A[Usuario sube imagen] --> B[Validar archivo]
    B --> C{¿Formato válido?}
    
    C -->|No| D[Error formato]
    C -->|Sí| E{¿Tamaño válido?}
    
    E -->|No| F[Error tamaño]
    E -->|Sí| G[Crear preview local]
    
    G --> H[Mostrar preview]
    H --> I[Usuario confirma]
    I --> J[Subir a Supabase Storage]
    
    J --> K[Generar URL pública]
    K --> L[Trigger función servidor]
    
    L --> M[Crear thumbnail (300x200)]
    M --> N[Crear imagen medium (800x600)]
    N --> O[Crear imagen large (1200x900)]
    
    O --> P[Guardar URLs en BD]
    P --> Q[Actualizar modelo Vehicle]
    Q --> R[Notificar frontend]
    R --> S[Actualizar UI]
    
    subgraph "Optimizaciones"
        T[WebP conversion]
        U[Compresión automática]
        V[CDN distribution]
        W[Lazy loading]
    end
    
    M --> T
    N --> T
    O --> T
    K --> V
    S --> W
```

## 24. Flujo de Notifications System (Futuro)

```mermaid
sequenceDiagram
    participant U1 as Usuario Interesado
    participant F as Frontend
    participant S as Supabase
    participant N as Notification Service
    participant U2 as Vendedor
    
    U1->>F: Contacta vendedor
    F->>S: Crear mensaje
    S->>N: Trigger notification
    
    N->>N: Determinar tipo notificación
    N->>S: Crear registro notification
    
    par Email
        N->>N: Enviar email al vendedor
    and Push
        N->>F: Push notification (si online)
    and SMS
        N->>N: Enviar SMS (si configurado)
    end
    
    U2->>F: Ve notificación
    F->>S: Marcar como leída
    
    U2->>F: Responde mensaje
    F->>S: Crear respuesta
    S->>N: Trigger notification a U1
    
    Note over N: Sistema escalable de notificaciones<br/>con preferencias de usuario
```