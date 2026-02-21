# FleetFlow System Architecture

## Overview
FleetFlow is a modular, cloud-native fleet and logistics management system built using modern web technologies with a focus on scalability, real-time capabilities, and multi-tenancy.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │   Driver     │          │
│  │  (Next.js)   │  │ (React Native)│  │   Mobile     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WSS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Next.js API Routes / tRPC / GraphQL Endpoint              │ │
│  │  - Authentication & Authorization                          │ │
│  │  - Request Validation & Rate Limiting                      │ │
│  │  - API Versioning                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Core Business Logic Services                  │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Fleet     │  │   Driver    │  │    Trip     │      │  │
│  │  │   Service   │  │   Service   │  │   Service   │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │ Maintenance │  │    Fuel     │  │   Expense   │      │  │
│  │  │   Service   │  │   Service   │  │   Service   │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │  Incident   │  │   Report    │  │    Alert    │      │  │
│  │  │   Service   │  │   Service   │  │   Service   │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐   ┌──────────────┐
│   Database   │    │  External APIs   │   │   Message    │
│  (Postgres)  │    │  & Services      │   │    Queue     │
│              │    │                  │   │   (Redis)    │
│  - Primary   │    │  - Maps API      │   │              │
│  - Replicas  │    │  - SMS Gateway   │   │  - Jobs      │
│              │    │  - Email Service │   │  - Events    │
│              │    │  - Payment       │   │  - Cache     │
└──────────────┘    └──────────────────┘   └──────────────┘
```

---

## System Components

### 1. Frontend Applications

#### Web Application (Next.js 14+)
- **Technology**: React 19, Next.js 14 App Router, TypeScript, Tailwind CSS
- **Features**:
  - Server-Side Rendering (SSR) for SEO and performance
  - Client-Side Rendering (CSR) for dynamic dashboards
  - Real-time updates via WebSockets
  - Responsive design for all screen sizes
  - Progressive Web App (PWA) capabilities

#### Mobile Application (React Native)
- **Technology**: React Native, TypeScript, Expo
- **Features**:
  - Cross-platform (iOS & Android)
  - Offline-first architecture
  - Real-time GPS tracking
  - Push notifications
  - Camera integration for document scanning

#### Driver Mobile App
- **Specialized Features**:
  - Trip acceptance/rejection
  - Turn-by-turn navigation
  - Proof of delivery capture
  - Fuel logging
  - Incident reporting

---

### 2. Backend Services

#### API Layer (Next.js API Routes)
```typescript
/api/
├── auth/
│   ├── login
│   ├── logout
│   ├── register
│   ├── refresh
│   └── reset-password
├── vehicles/
│   ├── [id]
│   ├── list
│   ├── create
│   ├── update
│   └── delete
├── drivers/
│   ├── [id]
│   ├── list
│   ├── create
│   └── performance
├── trips/
│   ├── [id]
│   ├── list
│   ├── create
│   ├── assign
│   └── tracking
├── maintenance/
│   ├── schedules
│   ├── records
│   └── alerts
├── fuel/
│   ├── records
│   └── analytics
├── expenses/
│   ├── list
│   └── create
├── incidents/
│   ├── [id]
│   └── report
├── reports/
│   ├── generate
│   └── download
└── notifications/
    ├── list
    └── mark-read
```

#### Service Layer Architecture
Each service follows a modular pattern:

```typescript
// Example: Vehicle Service
class VehicleService {
  // CRUD Operations
  async create(data: CreateVehicleDto): Promise<Vehicle>
  async findById(id: string): Promise<Vehicle>
  async findAll(filters: VehicleFilters): Promise<Vehicle[]>
  async update(id: string, data: UpdateVehicleDto): Promise<Vehicle>
  async delete(id: string): Promise<void>
  
  // Business Logic
  async assignDriver(vehicleId: string, driverId: string): Promise<void>
  async updateLocation(vehicleId: string, location: Location): Promise<void>
  async checkMaintenanceDue(vehicleId: string): Promise<boolean>
  async getUtilizationStats(vehicleId: string): Promise<Stats>
}
```

---

### 3. Database Layer

#### PostgreSQL Database
- **Primary Database**: All transactional data
- **Read Replicas**: For analytics and reporting
- **Connection Pooling**: PgBouncer for efficient connections
- **ORM**: Prisma for type-safe database access

#### Redis Cache & Queue
- **Session Storage**: User sessions and JWT tokens
- **API Response Cache**: Frequently accessed data
- **Job Queue**: Background tasks (BullMQ)
- **Real-time Data**: Publish/Subscribe for live updates
- **Rate Limiting**: API rate limit tracking

---

### 4. External Integrations

#### Maps & Geolocation
- **Primary**: Google Maps API
  - Geocoding
  - Distance Matrix
  - Directions API
  - Places API
  - Static Maps
- **Alternative**: Mapbox, OpenStreetMap

#### Communication Services
- **Email**: SendGrid / AWS SES
  - Transactional emails
  - Notifications
  - Reports
- **SMS**: Twilio / AWS SNS
  - OTP verification
  - Alerts
  - Emergency notifications
- **Push Notifications**: Firebase Cloud Messaging (FCM)

#### Payment Processing
- **Stripe**: Payment gateway
  - Subscription management
  - Invoice generation
  - Payment history

#### File Storage
- **AWS S3 / Cloudinary**:
  - Document uploads
  - Vehicle images
  - Driver documents
  - Receipt scans

#### GPS Tracking Devices
- **Integration Layer**: Support for multiple GPS device providers
  - Real-time location updates
  - Vehicle diagnostics
  - Geofencing

---

## Data Flow Architecture

### 1. Authentication Flow

```
┌─────────┐                ┌──────────┐               ┌──────────┐
│ Client  │                │   API    │               │ Database │
└─────────┘                └──────────┘               └──────────┘
     │                           │                          │
     │ 1. POST /api/auth/login   │                          │
     │ (email, password)          │                          │
     ├──────────────────────────>│                          │
     │                           │                          │
     │                           │ 2. Query user            │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │ 3. User data             │
     │                           │<─────────────────────────┤
     │                           │                          │
     │                           │ 4. Verify password       │
     │                           │    (bcrypt)              │
     │                           │                          │
     │                           │ 5. Generate JWT tokens   │
     │                           │    (access + refresh)    │
     │                           │                          │
     │                           │ 6. Store session in Redis│
     │                           │                          │
     │ 7. Return tokens +        │                          │
     │    user data              │                          │
     │<──────────────────────────┤                          │
     │                           │                          │
     │ 8. Store tokens in        │                          │
     │    localStorage/cookie    │                          │
     │                           │                          │
```

---

### 2. Trip Creation & Assignment Flow

```
┌─────────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────┐
│ Dispatcher  │    │   API    │    │   Services   │    │ Database │
│   (Admin)   │    │          │    │              │    │          │
└─────────────┘    └──────────┘    └──────────────┘    └──────────┘
       │                 │                 │                  │
       │ 1. Create Trip  │                 │                  │
       ├────────────────>│                 │                  │
       │                 │                 │                  │
       │                 │ 2. Validate     │                  │
       │                 │    request      │                  │
       │                 │                 │                  │
       │                 │ 3. Check        │                  │
       │                 │    vehicle      │                  │
       │                 │    availability │                  │
       │                 ├────────────────>│                  │
       │                 │                 │                  │
       │                 │                 │ 4. Query vehicles│
       │                 │                 ├─────────────────>│
       │                 │                 │                  │
       │                 │                 │ 5. Available     │
       │                 │                 │    vehicles      │
       │                 │                 │<─────────────────┤
       │                 │                 │                  │
       │                 │ 6. Check driver │                  │
       │                 │    availability │                  │
       │                 ├────────────────>│                  │
       │                 │                 │                  │
       │                 │                 │ 7. Query drivers │
       │                 │                 ├─────────────────>│
       │                 │                 │                  │
       │                 │                 │ 8. Available     │
       │                 │                 │    drivers       │
       │                 │                 │<─────────────────┤
       │                 │                 │                  │
       │                 │ 9. Calculate    │                  │
       │                 │    route & cost │                  │
       │                 ├────────────────>│                  │
       │                 │                 │                  │
       │                 │                 │ 10. Call Maps API│
       │                 │                 │                  │
       │                 │ 11. Create trip │                  │
       │                 │     record      │                  │
       │                 │                 ├─────────────────>│
       │                 │                 │                  │
       │                 │                 │ 12. Trip created │
       │                 │                 │<─────────────────┤
       │                 │                 │                  │
       │                 │ 13. Send        │                  │
       │                 │     notification│                  │
       │                 │     to driver   │                  │
       │                 │                 │                  │
       │ 14. Trip        │                 │                  │
       │     created     │                 │                  │
       │<────────────────┤                 │                  │
       │                 │                 │                  │
```

---

### 3. Real-Time GPS Tracking Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Driver   │      │   API    │      │  Redis   │      │  Admin   │
│  Mobile  │      │          │      │  Pub/Sub │      │  Dashboard│
└──────────┘      └──────────┘      └──────────┘      └──────────┘
     │                  │                  │                  │
     │ 1. Send GPS      │                  │                  │
     │    coordinates   │                  │                  │
     │    (every 30s)   │                  │                  │
     ├─────────────────>│                  │                  │
     │                  │                  │                  │
     │                  │ 2. Validate      │                  │
     │                  │    & process     │                  │
     │                  │                  │                  │
     │                  │ 3. Store in DB   │                  │
     │                  │    (async)       │                  │
     │                  │                  │                  │
     │                  │ 4. Publish to    │                  │
     │                  │    Redis channel │                  │
     │                  ├─────────────────>│                  │
     │                  │                  │                  │
     │                  │                  │ 5. Broadcast     │
     │                  │                  │    to subscribers│
     │                  │                  ├─────────────────>│
     │                  │                  │                  │
     │                  │                  │ 6. Update map    │
     │                  │                  │    in real-time  │
     │                  │                  │                  │
     │ 7. Check         │                  │                  │
     │    geofence      │                  │                  │
     │    violations    │                  │                  │
     │                  │                  │                  │
     │ 8. Trigger       │                  │                  │
     │    alerts if     │                  │                  │
     │    needed        │                  │                  │
     │                  │                  │                  │
```

---

### 4. Maintenance Alert Flow

```
┌──────────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Scheduled   │   │  Alert   │   │  Notif.  │   │  Users   │
│     Job      │   │  Service │   │  Service │   │          │
└──────────────┘   └──────────┘   └──────────┘   └──────────┘
       │                 │              │               │
       │ 1. Run daily    │              │               │
       │    @ 6:00 AM    │              │               │
       │                 │              │               │
       │ 2. Check all    │              │               │
       │    maintenance  │              │               │
       │    schedules    │              │               │
       ├────────────────>│              │               │
       │                 │              │               │
       │                 │ 3. Query DB  │               │
       │                 │    for due   │               │
       │                 │    maintenance│              │
       │                 │              │               │
       │                 │ 4. Find      │               │
       │                 │    vehicles  │               │
       │                 │    needing   │               │
       │                 │    service   │               │
       │                 │              │               │
       │                 │ 5. Create    │               │
       │                 │    alerts    │               │
       │                 ├─────────────>│               │
       │                 │              │               │
       │                 │              │ 6. Send email │
       │                 │              ├──────────────>│
       │                 │              │               │
       │                 │              │ 7. Send SMS   │
       │                 │              ├──────────────>│
       │                 │              │               │
       │                 │              │ 8. Create     │
       │                 │              │    in-app     │
       │                 │              │    notification│
       │                 │              │               │
       │                 │              │ 9. Update     │
       │                 │              │    vehicle    │
       │                 │              │    status     │
       │                 │              │               │
```

---

## Security Architecture

### 1. Authentication & Authorization

#### Multi-Layer Security
```
┌────────────────────────────────────────────────────┐
│              Layer 1: Network Security             │
│  - HTTPS/TLS encryption                            │
│  - CORS policies                                   │
│  - DDoS protection                                 │
└────────────────────────────────────────────────────┘
                      ▼
┌────────────────────────────────────────────────────┐
│         Layer 2: Authentication                    │
│  - JWT tokens (access + refresh)                   │
│  - Session management                              │
│  - Multi-factor authentication (MFA)               │
│  - OAuth 2.0 / SSO support                         │
└────────────────────────────────────────────────────┘
                      ▼
┌────────────────────────────────────────────────────┐
│         Layer 3: Authorization                     │
│  - Role-Based Access Control (RBAC)                │
│  - Organization-level isolation                    │
│  - Resource permissions                            │
└────────────────────────────────────────────────────┘
                      ▼
┌────────────────────────────────────────────────────┐
│         Layer 4: Data Security                     │
│  - Data encryption at rest                         │
│  - Sensitive data masking                          │
│  - Audit logging                                   │
└────────────────────────────────────────────────────┘
```

#### Role Permissions Matrix

| Feature | Super Admin | Admin | Manager | Dispatcher | Driver | Viewer |
|---------|-------------|-------|---------|------------|--------|--------|
| Organization Settings | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| User Management | ✓ | ✓ | Limited | ✗ | ✗ | ✗ |
| Vehicle Management | ✓ | ✓ | ✓ | View | View | View |
| Driver Management | ✓ | ✓ | ✓ | View | View Own | View |
| Trip Creation | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Trip Assignment | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Trip Updates | ✓ | ✓ | ✓ | ✓ | Own Trips | View |
| Maintenance | ✓ | ✓ | ✓ | View | ✗ | View |
| Fuel Records | ✓ | ✓ | ✓ | ✓ | Add Own | View |
| Expenses | ✓ | ✓ | ✓ | View | Add Own | View |
| Reports | ✓ | ✓ | ✓ | Limited | Own Data | View |
| Analytics | ✓ | ✓ | ✓ | Limited | ✗ | View |

---

### 2. Data Protection

#### Multi-Tenancy Isolation
```typescript
// Row-Level Security (RLS) Example
// Every query automatically filters by organization_id

// Prisma Middleware for organization isolation
prisma.$use(async (params, next) => {
  const { action, model } = params;
  
  // Get current user's organization
  const orgId = getCurrentOrganizationId();
  
  // Add organization filter to all queries
  if (action === 'findMany' || action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      organization_id: orgId
    };
  }
  
  // Prevent cross-organization updates/deletes
  if (action === 'update' || action === 'delete') {
    params.args.where = {
      ...params.args.where,
      organization_id: orgId
    };
  }
  
  return next(params);
});
```

#### Sensitive Data Handling
- **Password Hashing**: bcrypt with salt rounds >= 12
- **API Keys**: Encrypted using AES-256
- **Personal Information**: GDPR compliance
- **Payment Data**: PCI DSS compliance (handled by Stripe)

---

## Scalability Architecture

### 1. Horizontal Scaling

```
┌─────────────────────────────────────────────────┐
│              Load Balancer (Nginx)              │
│                                                 │
│  - Round-robin distribution                     │
│  - Health checks                                │
│  - SSL termination                              │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  App     │  │  App     │  │  App     │
  │ Instance │  │ Instance │  │ Instance │
  │    1     │  │    2     │  │    3     │
  └──────────┘  └──────────┘  └──────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   Database   │
              │  Connection  │
              │     Pool     │
              └──────────────┘
```

### 2. Database Scaling

#### Read Replicas
```
┌──────────────────┐
│  Primary DB      │
│  (Write)         │
└──────────────────┘
        │
        │ Replication
        ├──────────────┬──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Replica 1   │ │  Replica 2   │ │  Replica 3   │
│  (Read)      │ │  (Read)      │ │  (Analytics) │
└──────────────┘ └──────────────┘ └──────────────┘
```

#### Table Partitioning
- Partition large tables by date (trips, tracking, logs)
- Improves query performance
- Easier archival and purging

### 3. Caching Strategy

```
┌─────────────────────────────────────────────────┐
│                 Cache Layers                    │
├─────────────────────────────────────────────────┤
│  1. Browser Cache (Static assets)               │
│     - 1 year for immutable assets               │
│     - Service Worker for offline support        │
├─────────────────────────────────────────────────┤
│  2. CDN Cache (Cloudflare/CloudFront)           │
│     - Images, documents, static files           │
│     - Edge caching for global reach             │
├─────────────────────────────────────────────────┤
│  3. Application Cache (Redis)                   │
│     - Session data                              │
│     - API responses (1-60 minutes)              │
│     - Frequently accessed data                  │
├─────────────────────────────────────────────────┤
│  4. Database Query Cache                        │
│     - Postgres query results                    │
│     - Materialized views                        │
└─────────────────────────────────────────────────┘
```

---

## Performance Optimization

### 1. Frontend Optimization
- Code splitting and lazy loading
- Image optimization (Next.js Image component)
- Bundle size optimization
- Progressive Web App (PWA)
- Service Workers for offline functionality

### 2. Backend Optimization
- Database query optimization (indexes, joins)
- N+1 query prevention
- Batch operations
- Background jobs for heavy tasks
- API response compression

### 3. Real-Time Performance
- WebSocket connection pooling
- Message throttling (GPS updates)
- Client-side prediction
- Optimistic UI updates

---

## Monitoring & Observability

### 1. Application Monitoring
```
┌────────────────────────────────────────────────┐
│     Application Performance Monitoring        │
│                                                │
│  Tools: Vercel Analytics, Sentry, DataDog     │
│                                                │
│  Metrics:                                      │
│  - Request latency                             │
│  - Error rates                                 │
│  - API endpoint performance                    │
│  - Database query performance                  │
│  - Memory usage                                │
│  - CPU usage                                   │
└────────────────────────────────────────────────┘
```

### 2. Business Metrics
- Active users per organization
- Trips per day/week/month
- Vehicle utilization rates
- Driver performance metrics
- System uptime and availability

### 3. Alerting
- Error rate thresholds
- Performance degradation
- Database connection issues
- Failed background jobs
- Security incidents

---

## Deployment Architecture

### Development → Staging → Production Pipeline

```
┌─────────────────────────────────────────────────┐
│          Development Environment                │
│  - Local development                            │
│  - Docker Compose                               │
│  - Hot reload                                   │
└─────────────────────────────────────────────────┘
                    │
                    │ Git Push
                    ▼
┌─────────────────────────────────────────────────┐
│           CI/CD Pipeline (GitHub Actions)       │
│  - Run tests                                    │
│  - Lint code                                    │
│  - Build application                            │
│  - Security scanning                            │
└─────────────────────────────────────────────────┘
                    │
                    ├──────────────┬──────────────┐
                    ▼              ▼              ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │   Staging    │ │  Production  │ │     DR       │
         │              │ │              │ │  (Disaster   │
         │  - Preview   │ │  - Vercel    │ │   Recovery)  │
         │  - Testing   │ │  - AWS/GCP   │ │              │
         └──────────────┘ └──────────────┘ └──────────────┘
```

### Production Deployment (Vercel Recommended)
```
Advantages:
✓ Zero-config deployment
✓ Automatic HTTPS
✓ Global CDN
✓ Serverless functions
✓ Edge computing
✓ Built-in analytics
✓ Preview deployments
✓ Rollback capabilities
```

---

## Disaster Recovery & Business Continuity

### 1. Backup Strategy
- **Database Backups**: Daily full backup + hourly incremental
- **File Storage**: Geo-redundant storage
- **Configuration**: Version controlled in Git
- **Retention**: 30 days rolling backups

### 2. High Availability
- Multi-region deployment
- Automatic failover
- Load balancing across regions
- 99.9% uptime SLA

### 3. Recovery Procedures
- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 15 minutes
- Automated recovery scripts
- Regular disaster recovery drills

---

## Integration Architecture

### 1. Third-Party Integrations

```typescript
// Integration Service Pattern
interface IntegrationService {
  authenticate(): Promise<void>;
  isAvailable(): boolean;
  retryPolicy: RetryPolicy;
  fallbackProvider?: IntegrationService;
}

// Example: Maps Integration
class MapsIntegrationService implements IntegrationService {
  private primaryProvider: GoogleMapsAPI;
  private fallbackProvider: MapboxAPI;
  
  async geocode(address: string): Promise<Coordinates> {
    try {
      return await this.primaryProvider.geocode(address);
    } catch (error) {
      // Fallback to alternative provider
      return await this.fallbackProvider.geocode(address);
    }
  }
}
```

### 2. Webhook System
Support for outgoing webhooks to external systems:
- Trip status updates
- Vehicle alerts
- Maintenance due notifications
- Custom event triggers

### 3. API Integration Points
- REST API for external access
- GraphQL for flexible queries
- Webhook endpoints for real-time updates
- CSV/Excel import/export

---

## Technology Stack Summary

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand / React Context
- **Forms**: React Hook Form + Zod
- **Maps**: React Google Maps / Mapbox GL
- **Charts**: Recharts / Chart.js
- **Tables**: TanStack Table

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Cache**: Redis
- **Queue**: BullMQ
- **Auth**: NextAuth.js / JWT
- **Validation**: Zod

### DevOps
- **Hosting**: Vercel (Next.js) / AWS / GCP
- **Database**: Vercel Postgres / AWS RDS / Supabase
- **Storage**: AWS S3 / Cloudinary
- **CDN**: Cloudflare / AWS CloudFront
- **Monitoring**: Vercel Analytics / Sentry / DataDog
- **CI/CD**: GitHub Actions
- **Containers**: Docker (optional)

---

## Next Steps

1. ✅ Database schema designed
2. ✅ System architecture documented
3. ⬜ Implement Prisma schema
4. ⬜ Set up authentication system
5. ⬜ Build API endpoints
6. ⬜ Create frontend components
7. ⬜ Implement real-time features
8. ⬜ Add third-party integrations
9. ⬜ Set up monitoring and logging
10. ⬜ Deploy to production
