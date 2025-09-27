# Diagramas Avanzados - Automarket Multitenant

## 9. Diagrama de Base de Datos (ERD)

```mermaid
erDiagram
    TENANTS ||--o{ USERS : "belongs_to"
    TENANTS ||--o{ VEHICLES : "belongs_to"
    USERS ||--o{ VEHICLES : "sells"
    USERS ||--o{ USER_PROFILES : "has"
    USERS ||--o{ DEALER_PROFILES : "has"
    VEHICLES ||--o{ VEHICLE_IMAGES : "has"
    VEHICLES ||--o{ VEHICLE_FEATURES : "has"
    USERS ||--o{ USER_FAVORITES : "creates"
    VEHICLES ||--o{ USER_FAVORITES : "receives"
    
    TENANTS {
        uuid id PK
        varchar name
        varchar slug
        varchar country_code
        varchar currency
        varchar timezone
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    USERS {
        uuid id PK
        uuid tenant_id FK
        varchar email
        varchar phone
        enum user_type
        enum status
        timestamp email_verified_at
        timestamp phone_verified_at
        timestamp created_at
        timestamp updated_at
    }
    
    USER_PROFILES {
        uuid user_id PK,FK
        varchar first_name
        varchar last_name
        varchar avatar_url
        date date_of_birth
        enum gender
        varchar city
        varchar state
        decimal rating
        integer rating_count
        timestamp created_at
        timestamp updated_at
    }
    
    DEALER_PROFILES {
        uuid user_id PK,FK
        varchar company_name
        varchar logo_url
        text description
        varchar website
        varchar phone
        varchar address
        varchar city
        varchar state
        varchar postal_code
        timestamp verified_at
        timestamp created_at
        timestamp updated_at
    }
    
    VEHICLES {
        uuid id PK
        uuid tenant_id FK
        uuid seller_id FK
        varchar make
        varchar model
        integer year
        decimal price
        varchar currency
        integer mileage
        enum fuel_type
        enum transmission
        enum body_type
        varchar color
        text description
        enum status
        varchar location_city
        varchar location_state
        varchar vin
        varchar license_plate
        integer views_count
        integer favorites_count
        timestamp created_at
        timestamp updated_at
    }
    
    VEHICLE_IMAGES {
        uuid id PK
        uuid vehicle_id FK
        varchar image_url
        varchar alt_text
        boolean is_primary
        integer sort_order
        timestamp created_at
    }
    
    VEHICLE_FEATURES {
        uuid id PK
        uuid vehicle_id FK
        varchar name
        varchar category
        text description
        timestamp created_at
    }
    
    USER_FAVORITES {
        uuid id PK
        uuid user_id FK
        uuid vehicle_id FK
        timestamp created_at
    }
```

## 10. Diagrama de Seguridad - Row Level Security (RLS)

```mermaid
graph TB
    subgraph "RLS Policies"
        P1[Users Policy: tenant_id = current_tenant()]
        P2[Vehicles Policy: tenant_id = current_tenant()]
        P3[Profiles Policy: user_id = auth.uid()]
        P4[Favorites Policy: user_id = auth.uid()]
    end
    
    subgraph "Authentication Flow"
        A1[User Login] --> A2[JWT Token]
        A2 --> A3[Supabase Auth]
        A3 --> A4[Set tenant_id in JWT]
        A4 --> A5[RLS Enforcement]
    end
    
    subgraph "Data Access Control"
        D1[Query Request] --> D2{Check RLS Policy}
        D2 -->|Pass| D3[Return Data]
        D2 -->|Fail| D4[Access Denied]
    end
    
    A5 --> D2
    P1 --> D2
    P2 --> D2
    P3 --> D2
    P4 --> D2
```

## 11. Diagrama de Performance - Caching Strategy

```mermaid
graph TB
    subgraph "Frontend Caching"
        F1[React Query] --> F2[Vehicle List Cache]
        F1 --> F3[User Profile Cache]
        F1 --> F4[Search Results Cache]
    end
    
    subgraph "API Layer"
        A1[Vehicle Service] --> A2{Cache Check}
        A2 -->|Hit| A3[Return Cached Data]
        A2 -->|Miss| A4[Fetch from DB]
        A4 --> A5[Update Cache]
        A5 --> A3
    end
    
    subgraph "Database Layer"
        D1[PostgreSQL] --> D2[Connection Pooling]
        D1 --> D3[Query Optimization]
        D1 --> D4[Indexes on tenant_id]
    end
    
    subgraph "CDN Layer"
        C1[Vehicle Images] --> C2[Cloudflare CDN]
        C1 --> C3[Supabase Storage]
    end
    
    F1 --> A1
    A4 --> D1
    C2 --> F2
```

## 12. Diagrama de Deployment

```mermaid
graph TB
    subgraph "Development Environment"
        DEV1[Local Development]
        DEV2[Docker Compose]
        DEV3[Hot Reload]
    end
    
    subgraph "Staging Environment"
        STG1[Vercel Preview]
        STG2[Supabase Staging]
        STG3[Test Database]
    end
    
    subgraph "Production Environment"
        PROD1[Vercel Production]
        PROD2[Supabase Production]
        PROD3[PostgreSQL Cluster]
        PROD4[CDN Distribution]
    end
    
    subgraph "CI/CD Pipeline"
        CI1[GitHub Actions]
        CI2[TypeScript Check]
        CI3[Unit Tests]
        CI4[Build Process]
        CI5[Deploy to Vercel]
    end
    
    DEV1 --> STG1
    STG1 --> CI1
    CI1 --> CI2
    CI2 --> CI3
    CI3 --> CI4
    CI4 --> CI5
    CI5 --> PROD1
    
    PROD1 --> PROD2
    PROD2 --> PROD3
    PROD1 --> PROD4
```

## 13. Diagrama de API Endpoints (Future)

```mermaid
graph LR
    subgraph "Vehicle API"
        V1[GET /api/vehicles]
        V2[GET /api/vehicles/:id]
        V3[POST /api/vehicles]
        V4[PUT /api/vehicles/:id]
        V5[DELETE /api/vehicles/:id]
    end
    
    subgraph "User API"
        U1[GET /api/users/profile]
        U2[PUT /api/users/profile]
        U3[POST /api/users/register]
        U4[POST /api/users/verify-email]
    end
    
    subgraph "Search API"
        S1[GET /api/search/vehicles]
        S2[GET /api/search/filters]
        S3[GET /api/search/suggestions]
    end
    
    subgraph "Tenant API"
        T1[GET /api/tenants/current]
        T2[GET /api/tenants/config]
    end
    
    subgraph "Auth API"
        A1[POST /auth/login]
        A2[POST /auth/logout]
        A3[POST /auth/refresh]
        A4[GET /auth/user]
    end
```

## 14. Diagrama de Componentes React

```mermaid
graph TB
    subgraph "App Component Tree"
        APP[App.tsx]
        
        subgraph "Layout Components"
            HEADER[Header.tsx]
            FOOTER[Footer.tsx]
            NAV[Navigation.tsx]
        end
        
        subgraph "Page Components"
            HOME[HomePage.tsx]
            CATALOG[VehiclesCatalog.tsx]
            DETAIL[VehicleDetail.tsx]
            PROFILE[UserProfile.tsx]
        end
        
        subgraph "Form Components"
            SEARCH[SearchForm.tsx]
            FILTERS[FiltersPanel.tsx]
            VEHICLE_FORM[VehicleForm.tsx]
            USER_FORM[UserRegistration.tsx]
        end
        
        subgraph "UI Components"
            CARD[VehicleCard.tsx]
            MODAL[Modal.tsx]
            BUTTON[Button.tsx]
            INPUT[InputField.tsx]
        end
        
        subgraph "Hooks"
            USE_VEHICLES[useVehicleCatalog.ts]
            USE_AUTH[useAuth.ts]
            USE_FILTERS[useFilters.ts]
        end
    end
    
    APP --> HEADER
    APP --> HOME
    APP --> FOOTER
    
    HOME --> CATALOG
    CATALOG --> SEARCH
    CATALOG --> FILTERS
    CATALOG --> CARD
    
    CATALOG --> USE_VEHICLES
    SEARCH --> USE_FILTERS
    PROFILE --> USE_AUTH
    
    CARD --> BUTTON
    SEARCH --> INPUT
    VEHICLE_FORM --> INPUT
```

## 15. Diagrama de Estados de la Aplicación

```mermaid
stateDiagram-v2
    [*] --> Loading
    
    Loading --> Authenticated : login_success
    Loading --> Unauthenticated : no_session
    Loading --> Error : auth_error
    
    Unauthenticated --> Loading : login_attempt
    Unauthenticated --> Register : register_click
    
    Register --> Loading : register_submit
    Register --> Unauthenticated : cancel
    
    Authenticated --> VehicleCatalog : navigate_catalog
    Authenticated --> UserProfile : navigate_profile
    Authenticated --> VehicleForm : create_vehicle
    Authenticated --> Unauthenticated : logout
    
    VehicleCatalog --> VehicleDetail : select_vehicle
    VehicleCatalog --> VehicleCatalog : apply_filters
    
    VehicleDetail --> VehicleCatalog : back
    VehicleDetail --> ContactSeller : contact_click
    
    VehicleForm --> VehicleCatalog : save_success
    VehicleForm --> VehicleForm : validation_error
    
    UserProfile --> UserProfile : update_profile
    
    Error --> Loading : retry
    Error --> Unauthenticated : reset
```

## 16. Diagrama de Testing Strategy

```mermaid
graph TB
    subgraph "Unit Tests"
        UT1[Model Tests - quickTest.ts]
        UT2[Service Tests - vehicleService.test.ts]
        UT3[Hook Tests - useVehicleCatalog.test.ts]
        UT4[Utility Tests - validation.test.ts]
    end
    
    subgraph "Integration Tests"
        IT1[Component Integration]
        IT2[Service Integration]
        IT3[Database Integration]
        IT4[API Integration]
    end
    
    subgraph "End-to-End Tests"
        E2E1[User Registration Flow]
        E2E2[Vehicle Search Flow]
        E2E3[Vehicle Creation Flow]
        E2E4[Multi-tenant Scenarios]
    end
    
    subgraph "Performance Tests"
        PT1[Load Testing]
        PT2[Stress Testing]
        PT3[Memory Usage]
        PT4[Query Performance]
    end
    
    subgraph "Testing Tools"
        JEST[Jest/Vitest]
        RTL[React Testing Library]
        PW[Playwright]
        K6[K6 Load Testing]
    end
    
    UT1 --> JEST
    UT2 --> JEST
    UT3 --> RTL
    IT1 --> RTL
    E2E1 --> PW
    PT1 --> K6
```