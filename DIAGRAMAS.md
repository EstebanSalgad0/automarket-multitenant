# Diagramas del Proyecto Automarket Multitenant

## 1. Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Frontend - React + TypeScript"
        A[App.tsx] --> B[Components]
        A --> C[Hooks]
        A --> D[Services]
        
        B --> B1[VehiclesCatalog]
        B --> B2[UserProfile]
        B --> B3[DealerRegistration]
        B --> B4[SellerRegistration]
        
        C --> C1[useAuth]
        C --> C2[useVehicleCatalog]
        
        D --> D1[vehicleService]
    end
    
    subgraph "Backend Services"
        E[Supabase] --> E1[PostgreSQL]
        E --> E2[Auth]
        E --> E3[Storage]
        E --> E4[Real-time]
        
        F[Docker] --> F1[PostgreSQL Container]
        F --> F2[Adminer Container]
    end
    
    subgraph "Data Layer"
        G[Models] --> G1[BaseModel]
        G --> G2[User]
        G --> G3[Vehicle] 
        G --> G4[Tenant]
        G --> G5[ModelFactory]
    end
    
    D1 --> E
    C2 --> D1
    B1 --> C2
    G5 --> G2
    G5 --> G3
    G5 --> G4
    G2 --> G1
    G3 --> G1
    G4 --> G1
```

## 2. Modelo de Datos - Diagrama de Clases

```mermaid
classDiagram
    class BaseModel {
        <<abstract>>
        +id: string
        +created_at: Date
        +updated_at: Date
        +generateId(): string
        +touch(): void
        +toDatabase(): Record~string, any~*
        +validate(): ValidationResult*
        +toJSON(): Record~string, any~
    }
    
    class User {
        +tenant_id: string
        +email: string
        +phone?: string
        +user_type: UserType
        +status: UserStatus
        +email_verified_at?: Date
        +phone_verified_at?: Date
        +create(data: CreateUserData): User$
        +activate(): void
        +suspend(): void
        +verifyEmail(): void
        +verifyPhone(): void
        +changeUserType(type: UserType): void
        +isActive(): boolean
        +isVerified(): boolean
        +toDatabase(): Record~string, any~
        +validate(): ValidationResult
    }
    
    class Vehicle {
        +tenant_id: string
        +seller_id: string
        +make: string
        +model: string
        +year: number
        +price: number
        +currency: string
        +mileage: number
        +fuel_type: FuelType
        +transmission: TransmissionType
        +body_type: BodyType
        +color: string
        +description?: string
        +status: VehicleStatus
        +images: VehicleImage[]
        +features: VehicleFeature[]
        +location_city?: string
        +location_state?: string
        +vin?: string
        +license_plate?: string
        +create(data: CreateVehicleData): Vehicle$
        +updatePrice(newPrice: number): void
        +addImage(image: VehicleImage): void
        +removeImage(imageId: string): void
        +addFeature(feature: VehicleFeature): void
        +removeFeature(featureName: string): void
        +calculateDepreciation(): number
        +isAvailableForSale(): boolean
        +getPrimaryImage(): VehicleImage | null
        +markAsAvailable(): void
        +markAsSold(): void
        +markAsReserved(): void
        +toDatabase(): Record~string, any~
        +validate(): ValidationResult
    }
    
    class Tenant {
        +name: string
        +slug: string
        +country_code: string
        +currency: string
        +timezone: string
        +status: TenantStatus
        +create(data: CreateTenantData): Tenant$
        +activate(): void
        +deactivate(): void
        +setMaintenance(): void
        +updateCurrency(currency: string): void
        +updateTimezone(timezone: string): void
        +isActive(): boolean
        +generateSlug(): string
        +toDatabase(): Record~string, any~
        +validate(): ValidationResult
    }
    
    class ModelFactory {
        <<utility>>
        +createUser(data: any): User$
        +createVehicle(data: any): Vehicle$
        +createTenant(data: any): Tenant$
    }
    
    BaseModel <|-- User
    BaseModel <|-- Vehicle
    BaseModel <|-- Tenant
    ModelFactory ..> User : creates
    ModelFactory ..> Vehicle : creates
    ModelFactory ..> Tenant : creates
```

## 3. Diagrama de Arquitectura Multi-Tenant

```mermaid
graph TB
    subgraph "Multi-Tenant Architecture"
        subgraph "Tenant: Chile"
            T1[chile.automarket.com] --> D1[(Database: tenant_id='chile')]
            T1 --> U1[Users Chile]
            T1 --> V1[Vehicles Chile]
        end
        
        subgraph "Tenant: Argentina"
            T2[argentina.automarket.com] --> D2[(Database: tenant_id='argentina')]
            T2 --> U2[Users Argentina]
            T2 --> V2[Vehicles Argentina]
        end
        
        subgraph "Tenant: Mexico"
            T3[mexico.automarket.com] --> D3[(Database: tenant_id='mexico')]
            T3 --> U3[Users Mexico]
            T3 --> V3[Vehicles Mexico]
        end
    end
    
    subgraph "Shared Infrastructure"
        S1[Supabase]
        S2[PostgreSQL with RLS]
        S3[Authentication]
        S4[File Storage]
    end
    
    D1 --> S2
    D2 --> S2
    D3 --> S2
    T1 --> S1
    T2 --> S1
    T3 --> S1
    S1 --> S3
    S1 --> S4
```

## 4. Flujo de Datos - Vehicle Service

```mermaid
sequenceDiagram
    participant C as Component
    participant H as Hook (useVehicleCatalog)
    participant S as VehicleService
    participant M as ModelFactory
    participant D as Database/Mock
    
    C->>H: getVehicles(filters)
    H->>S: vehicleService.getVehicles(filters, limit, offset)
    S->>D: fetch vehicles data
    D->>S: raw data[]
    S->>M: ModelFactory.createVehicle(data)
    M->>S: Vehicle instance
    S->>H: VehicleWithDetails[]
    H->>C: vehicles state updated
    C->>C: render vehicle list
```

## 5. Diagrama de Estados - Vehicle

```mermaid
stateDiagram-v2
    [*] --> PENDING
    
    PENDING --> AVAILABLE : approve()
    PENDING --> SUSPENDED : reject()
    
    AVAILABLE --> RESERVED : reserve()
    AVAILABLE --> SOLD : sell()
    AVAILABLE --> SUSPENDED : suspend()
    
    RESERVED --> AVAILABLE : cancel_reservation()
    RESERVED --> SOLD : complete_sale()
    RESERVED --> SUSPENDED : suspend()
    
    SOLD --> [*]
    
    SUSPENDED --> AVAILABLE : reactivate()
    SUSPENDED --> [*] : delete()
```

## 6. Estructura de Carpetas

```
📁 automarket-multitenant/
├── 📁 app/                          # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 models/               # Domain Models
│   │   │   ├── 📄 BaseModel.ts      # Abstract base class
│   │   │   ├── 📄 User.ts           # User model
│   │   │   ├── 📄 Vehicle.ts        # Vehicle model
│   │   │   ├── 📄 Tenant.ts         # Tenant model
│   │   │   └── 📄 index.ts          # ModelFactory + exports
│   │   ├── 📁 services/             # Business Logic Layer
│   │   │   └── 📄 vehicleServiceNew.ts # Vehicle operations
│   │   ├── 📁 hooks/                # React Hooks
│   │   │   ├── 📄 useAuth.ts        # Authentication
│   │   │   └── 📄 useVehicleCatalog.ts # Vehicle catalog
│   │   ├── 📁 components/           # UI Components
│   │   │   ├── 📄 VehiclesCatalog.tsx
│   │   │   ├── 📄 UserProfile.tsx
│   │   │   ├── 📄 DealerRegistration.tsx
│   │   │   └── 📄 SellerRegistration.tsx
│   │   ├── 📁 lib/                  # External Services
│   │   │   ├── 📄 supabase.ts       # Supabase client
│   │   │   └── 📄 database.types.ts # DB type definitions
│   │   ├── 📁 utils/                # Utilities & Testing
│   │   │   ├── 📄 quickTest.ts      # Model tests
│   │   │   ├── 📄 modelsDemo.ts     # Demo scenarios
│   │   │   └── 📄 nodeTest.js       # Node.js test
│   │   ├── 📄 App.tsx               # Main component
│   │   ├── 📄 main.tsx              # Entry point
│   │   └── 📄 vite-env.d.ts         # Vite types
│   ├── 📄 package.json              # Dependencies
│   ├── 📄 tsconfig.json             # TypeScript config
│   ├── 📄 vite.config.ts            # Vite config
│   └── 📄 index.html                # HTML template
├── 📁 api/                          # Backend API (Future)
├── 📁 db/                           # Database scripts
│   └── 📄 init.sql                  # Initial schema
├── 📁 supabase/                     # Supabase config
│   └── 📄 schema.sql                # Database schema
├── 📄 docker-compose.yml            # Docker services
├── 📄 README.md                     # Project documentation
└── 📄 RESUMEN_COMPLETO.txt          # Complete summary
```

## 7. Diagrama de Dependencias

```mermaid
graph LR
    subgraph "External Dependencies"
        R[React] 
        T[TypeScript]
        V[Vite]
        S[Supabase]
        D[Docker]
    end
    
    subgraph "Internal Modules"
        M[Models] --> MF[ModelFactory]
        SE[Services] --> M
        H[Hooks] --> SE
        C[Components] --> H
        A[App] --> C
    end
    
    subgraph "Configuration"
        TC[tsconfig.json]
        VC[vite.config.ts]
        PC[package.json]
        DC[docker-compose.yml]
    end
    
    A --> R
    M --> T
    SE --> S
    H --> R
    C --> R
    
    TC --> T
    VC --> V
    PC --> R
    DC --> D
```

## 8. Diagrama de Casos de Uso

```mermaid
graph TB
    subgraph "Actores"
        B[Buyer - Comprador]
        S[Seller - Vendedor]
        D[Dealer - Concesionario]
        A[Admin - Administrador]
    end
    
    subgraph "Casos de Uso - Buyer"
        UC1[Buscar Vehículos]
        UC2[Filtrar por Criterios]
        UC3[Ver Detalles del Vehículo]
        UC4[Agregar a Favoritos]
        UC5[Contactar Vendedor]
    end
    
    subgraph "Casos de Uso - Seller"
        UC6[Registrar Vehículo]
        UC7[Actualizar Información]
        UC8[Subir Imágenes]
        UC9[Gestionar Consultas]
        UC10[Marcar como Vendido]
    end
    
    subgraph "Casos de Uso - Dealer"
        UC11[Gestionar Inventario]
        UC12[Publicar Multiple Vehículos]
        UC13[Gestionar Perfil de Empresa]
        UC14[Ver Estadísticas]
    end
    
    subgraph "Casos de Uso - Admin"
        UC15[Gestionar Tenants]
        UC16[Moderar Contenido]
        UC17[Ver Analytics]
        UC18[Configurar Sistema]
    end
    
    B --> UC1
    B --> UC2
    B --> UC3
    B --> UC4
    B --> UC5
    
    S --> UC6
    S --> UC7
    S --> UC8
    S --> UC9
    S --> UC10
    
    D --> UC11
    D --> UC12
    D --> UC13
    D --> UC14
    
    A --> UC15
    A --> UC16
    A --> UC17
    A --> UC18
```