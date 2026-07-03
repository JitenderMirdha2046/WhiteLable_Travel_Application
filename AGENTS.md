# TravelProject — White-Label Multi-Tenant Platform

## Project Vision
AI-powered travel planning platform sold as a white-label SaaS to travel agencies.
Agencies pay monthly subscription — their customers use the branded platform to create AI itineraries.

---

## Architecture — Ek Codebase, Multiple Brands

```
                    ┌──────────────────────────┐
                    │   API Gateway (:8080)     │
                    │   Tenant-aware routing     │
                    └──────────┬───────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     User Service         Trip Service        AI Service
     (:8081)              (:8082)             (:8083)
     JWT Auth +           CRUD + Kafka        Gemini
     Tenant-aware         + Redis + Rate       Consumer
                          Limiting
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
              PostgreSQL              Redis
          travel_user_db           Per-tenant cache
          travel_trip_db           keys
          (tenant_id columns)
```

---

## Database Schema — Multi-Tenant Changes

### New Table: `tenants`
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    subdomain VARCHAR(100) UNIQUE,
    logo_url VARCHAR(500),
    primary_color VARCHAR(20) DEFAULT '#3b82f6',    -- hex
    accent_color VARCHAR(20) DEFAULT '#a855f7',     -- hex
    tagline VARCHAR(200),
    plan_type VARCHAR(20) DEFAULT 'starter',         -- starter | growth | enterprise
    status VARCHAR(20) DEFAULT 'active',             -- active | suspended | trial
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Existing Tables — Add `tenant_id`

| Table | New Column | Notes |
|---|---|---|
| `users` | `tenant_id UUID NOT NULL` | FK to tenants |
| `trips` | `tenant_id UUID NOT NULL` | FK to tenants |
| `trip_budget` | `tenant_id UUID NOT NULL` | FK to tenants |
| `trip_comparison` | `tenant_id UUID NOT NULL` | FK to tenants |

### Indexes
```sql
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_trips_tenant ON trips(tenant_id);
CREATE INDEX idx_domain ON tenants(domain);
CREATE INDEX idx_subdomain ON tenants(subdomain);
```

---

## Development Phases — Chunk by Chunk

### PHASE 1: Backend Multi-Tenant Foundation (Days 1-3)

**Chunk 1.1: Tenant Entity + Repository**
- [ ] Create `Tenant.java` entity (JPA)
- [ ] Create `TenantRepository.java` (findByDomain, findBySubdomain)
- [ ] Create `init-dbs.sql` update (add tenants table)
- [ ] No UI yet — test via direct API calls

**Chunk 1.2: Add `tenant_id` to Existing Entities**
- [ ] Add `tenantId` field to `User.java`
- [ ] Add `tenantId` field to `Trip.java`
- [ ] Add `tenantId` field to `TripBudget.java`
- [ ] Add `tenantId` field to `TripComparison.java`
- [ ] Add `tenantId` field to all DTOs (RegisterRequest, LoginRequest, TripResponse, CreateTripRequest)

**Chunk 1.3: Tenant Context — How requests know which tenant**
- [ ] Create `TenantContext.java` — ThreadLocal holder for current tenant ID
- [ ] Create `TenantFilter.java` — Servlet filter that:
  - Reads `X-Tenant-Id` header (for API calls from gateway)
  - Reads `X-Tenant-Domain` header (for domain-based lookup)
  - Sets `TenantContext.setTenantId()`
  - Clears after request
- [ ] Register filter in all services (user, trip)

**Chunk 1.4: Update Service Layer — All Queries Tenant-Aware**
- [ ] `UserService`: register() → assigns tenantId, login() → checks tenant
- [ ] `TripService`: createTrip() → sets tenantId, getUserTrips() → filters by tenant
- [ ] `TripService`: getTripById, deleteTrip, replanTrip → ownership check includes tenant
- [ ] `TripService`: compareTrips, searchTrips → tenant-scoped
- [ ] `JwtService`: include tenantId in JWT claims

**Chunk 1.5: Update API Gateway — Tenant Routing**
- [ ] `TenantGatewayFilterFactory.java`:
  - Reads domain from request header
  - Calls tenant service (or cached lookup) to get tenant ID
  - Injects `X-Tenant-Id` header to downstream services
- [ ] Update `AuthGatewayFilterFactory` — pass tenant context

---

### PHASE 2: Admin Panel — Agency Self-Service (Days 4-6)

**Chunk 2.1: Tenant Registration Flow**
- [ ] `POST /api/tenants/register` — agency signs up (name, email, password, domain)
- [ ] Creates tenant record (trial status, 14-day expiry)
- [ ] Creates admin user for the agency
- [ ] Returns tenant ID + admin JWT

**Chunk 2.2: Admin Dashboard Frontend**
- [ ] New route: `/admin`
- [ ] Admin login (separate from user login — uses `X-Tenant-Id` + role check)
- [ ] Pages:
  - Overview: total users, trips, usage stats
  - Branding: logo upload, colors, tagline
  - Users: list/manage their customers
  - Billing: plan details, invoice history

**Chunk 2.3: Branding Configuration API**
- [ ] `PUT /api/tenants/{id}/branding` — update logo, colors, tagline
- [ ] `GET /api/tenants/{id}/branding` — public endpoint (no auth) — returns brand config
- [ ] File upload: logo image → store on server/S3 → return URL

**Chunk 2.4: Admin UI — Branding Page**
- [ ] Form: logo upload (preview), color picker or preset themes, tagline input
- [ ] Real-time preview panel — shows how landing page looks with current settings
- [ ] Save button → API call → branding updated

---

### PHASE 3: Dynamic Frontend Theming (Days 7-8)

**Chunk 3.1: Brand Config Hook**
- [ ] Create `useBranding()` hook:
  - Fetches `GET /api/tenants/branding` on app load
  - Returns `{ logo, primaryColor, accentColor, name, tagline }`
  - Caches in localStorage (1 hour expiry)
- [ ] Uses domain/subdomain to identify tenant

**Chunk 3.2: CSS Variable Theme System**
- [ ] Add CSS variables to `index.css`:
  ```css
  :root {
    --color-primary: #3b82f6;
    --color-accent: #a855f7;
    --color-primary-dark: #2563eb;
  }
  ```
- [ ] Create `ThemeProvider.jsx` — sets CSS vars from branding API response
  ```jsx
  document.documentElement.style.setProperty('--color-primary', branding.primaryColor)
  ```
- [ ] Update `tailwind.config.js` — use CSS variables instead of hardcoded colors
  ```js
  primary: {
    400: 'var(--color-primary)',
    500: 'var(--color-primary)',
    600: 'var(--color-primary-dark)',
  }
  ```

**Chunk 3.3: Update React Components**
- [ ] `Navbar` — load logo from branding API instead of hardcoded TravelPlanner logo
- [ ] `Sidebar` — same, dynamic logo + name
- [ ] `LandingPage` — dynamic hero text (agency tagline), brand colors
- [ ] `Dashboard` — dynamic welcome text with agency name
- [ ] All gradient-text uses CSS vars now → auto matches brand

**Chunk 3.4: Domain Detection**
- [ ] Create `domainUtils.js`:
  - Reads `window.location.hostname`
  - Maps to tenant (via API or local cache)
  - Falls back to default "TravelPlanner" branding if no tenant matches
- [ ] For development: `X-Tenant-Domain` header or query param override

---

### PHASE 4: Billing & Subscription (Days 9-10)

**Chunk 4.1: Pricing Page**
- [ ] `GET /api/tenants/pricing` — returns plans
- [ ] Frontend pricing page: `/pricing` — 3 tiers (Starter $199, Growth $499, Enterprise Custom)
- [ ] Feature comparison table

**Chunk 4.2: Stripe Integration**
- [ ] `stripe-webhook` endpoint in notification-service (or new billing-service)
- [ ] `POST /api/billing/create-subscription` — creates Stripe checkout session
- [ ] `POST /api/billing/webhook` — handles subscription.created, payment.success, subscription.cancelled
- [ ] On payment success → activate tenant (set status=active, plan_type=growth)

**Chunk 4.3: Tenant Activation Flow**
- [ ] Webhook received → tenant activated
- [ ] Welcome email sent to agency admin
- [ ] Tenant DNS auto-configuration instructions sent

---

### PHASE 5: DNS & Domain Setup (Days 11-12)

**Chunk 5.1: Subdomain Auto-Provision**
- [ ] Aapka wildcard DNS: `*.travelplanner.com` → aapke server IP pe point
- [ ] Agency milta hai: `manalitravels.travelplanner.com`
- [ ] Backend `TenantFilter` extracts subdomain from host header
- [ ] Looks up tenant by subdomain → applies branding

**Chunk 5.2: Custom Domain Support**
- [ ] Admin panel mein: "Add your domain" input
- [ ] Aap agency ko batate ho: "apne DNS mein yeh CNAME record daalo: `manalitravels.com → travelplanner.com`"
- [ ] Backend: verify domain ownership (TXT record check ya manual approval)
- [ ] On verify → map domain to tenant

**Chunk 5.3: Nginx/Reverse Proxy Config**
- [ ] Update nginx config or API Gateway to handle multiple domains
- [ ] SSL cert auto-provision via Let's Encrypt (Certbot)
- [ ] All traffic → gateway → tenant-aware routing

---

### PHASE 6: Agency Admin Features (Days 13-15)

**Chunk 6.1: Usage Analytics Dashboard**
- [ ] Total trips, active users, AI generations count
- [ ] Popular destinations within their tenant
- [ ] Daily/weekly/monthly graphs

**Chunk 6.2: Customer Management**
- [ ] List all users registered under their tenant
- [ ] View customer trips (read-only)
- [ ] Export customer data (CSV)

**Chunk 6.3: White-Label PDF (Trip Export)**
- [ ] PDF includes agency logo + brand colors + tagline
- [ ] "Powered by TravelPlanner" small text at bottom (optional)

**Chunk 6.4: Multi-Language Support (Optional)**
- [ ] Backend: Accept `Accept-Language` header
- [ ] Frontend: i18n setup with react-i18next
- [ ] Agency can select their language from admin panel

---

## Component Tree — Frontend

```
App.jsx
├── TenantProvider (reads domain → fetches branding)
│   ├── ThemeApplier (sets CSS vars)
│   ├── Public Routes
│   │   ├── / → LandingPage (branded)
│   │   ├── /login → Login (branded)
│   │   ├── /register → Register (branded)
│   │   └── /pricing → PricingPage
│   └── Admin Routes
│       └── /admin → AdminLayout
│           ├── /admin/overview → AdminOverview
│           ├── /admin/branding → BrandingSetup
│           ├── /admin/users → CustomerList
│           └── /admin/billing → BillingPage
```

---

## API Endpoints — Complete List

### Public (No Auth)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tenants/branding` | Get branding by domain (public) |
| POST | `/api/auth/register` | Register (includes tenantId) |
| POST | `/api/auth/login` | Login (tenant-scoped) |
| GET | `/api/tenants/pricing` | Pricing plans |

### Admin (Agency Admin Auth Required)
| Method | Endpoint | Description |
|---|---|---|
| PUT | `/api/tenants/branding` | Update brand settings |
| POST | `/api/tenants/logo` | Upload logo |
| GET | `/api/admin/users` | List tenant's users |
| GET | `/api/admin/stats` | Usage statistics |
| GET | `/api/admin/trips` | All trips in tenant (read-only) |
| POST | `/api/billing/create-subscription` | Create Stripe session |
| GET | `/api/billing/invoices` | Invoice history |

### Stripe Webhook (No Auth)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/billing/webhook` | Stripe events |

---

## File Changes Summary

### New Files to Create
```
trip-service/src/main/java/com/travel/trip/entity/Tenant.java
trip-service/src/main/java/com/travel/trip/repository/TenantRepository.java
trip-service/src/main/java/com/travel/trip/config/TenantContext.java
trip-service/src/main/java/com/travel/trip/config/TenantFilter.java
trip-service/src/main/java/com/travel/trip/controller/TenantController.java
trip-service/src/main/java/com/travel/trip/service/TenantService.java
trip-service/src/main/java/com/travel/trip/dto/TenantRequest.java
trip-service/src/main/java/com/travel/trip/dto/TenantResponse.java

api-gateway/src/main/java/com/travel/gateway/config/TenantGatewayFilterFactory.java

frontend/src/hooks/useBranding.js
frontend/src/utils/domainUtils.js
frontend/src/context/TenantProvider.jsx
frontend/src/context/ThemeProvider.jsx
frontend/src/pages/admin/AdminLogin.jsx
frontend/src/pages/admin/AdminOverview.jsx
frontend/src/pages/admin/BrandingSetup.jsx
frontend/src/pages/admin/CustomerList.jsx
frontend/src/pages/admin/BillingPage.jsx
frontend/src/pages/admin/AdminLayout.jsx
frontend/src/pages/PricingPage.jsx
```

### Existing Files to Modify
```
user-service/.../entity/User.java          → add tenantId
user-service/.../dto/RegisterRequest.java  → add tenantId
user-service/.../dto/LoginRequest.java     → add tenantId
user-service/.../dto/AuthResponse.java     → add tenantId
user-service/.../service/UserService.java  → tenant-scoped queries
user-service/.../service/JwtService.java   → include tenantId in JWT
user-service/.../config/SecurityConfig.java→ add TenantFilter

trip-service/.../entity/Trip.java          → add tenantId
trip-service/.../entity/TripBudget.java    → add tenantId
trip-service/.../entity/TripComparison.java→ add tenantId
trip-service/.../dto/TripResponse.java     → add tenantId
trip-service/.../dto/CreateTripRequest.java→ add tenantId
trip-service/.../service/TripService.java  → all queries tenant-scoped
trip-service/.../controller/TripController.java → inject tenant headers
trip-service/.../repository/TripRepository.java → add tenant filters to queries

api-gateway/.../security/AuthGatewayFilterFactory.java → pass tenant headers
api-gateway/.../config/CorsConfig.java → allow custom domains
api-gateway/src/main/resources/application.yml → wildcard routes

frontend/src/App.jsx → add TenantProvider, theme routes
frontend/src/index.css → CSS variable theme system
frontend/src/components/Navbar.jsx → dynamic logo/name
frontend/src/components/Sidebar.jsx → dynamic logo/name
frontend/src/pages/LandingPage.jsx → branded hero
frontend/src/main.jsx → wrap with TenantProvider

docker/init-dbs.sql → add tenants table

tailwind.config.js → CSS variable colors
```

---

## How to Run After Each Phase

```bash
# Backend only (Docker)
docker compose up -d postgres redis

# Or full stack
docker compose up -d --build

# Frontend (host machine)
cd frontend && npm run dev

# Test multi-tenant:
# http://localhost:5173/?tenant=manali    → Manali branding
# http://localhost:5173/?tenant=goa       → Goa branding
# http://localhost:5173/                   → Default branding
```

---

## Database Migrations — Flyway

`ddl-auto: validate` use karte hain production mein — **Flyway** migrations se tables manage hote hain.

### Migration Files
```
user-service/src/main/resources/db/migration/
  ├── V1__create_users_table.sql

trip-service/src/main/resources/db/migration/
  ├── V1__create_trip_tables.sql          (trips, trip_budget, trip_comparison)
  ├── V2__add_tenants_table.sql           (tenants table)
  ├── V3__add_tenant_id_columns.sql       (tenant_id in existing tables)
  └── V4__... (future changes)
```

### Golden Rule — Never Edit Existing Migrations
- Migration file ek baar run ho gaya to **kabhi mat badlo**
- Nayi change ke liye naya file (V3, V4, V5...) banao
- Example: `V3__add_tenant_id_columns.sql`
- Production mein `flyway repair` sirf emergency mein use karo

### How It Works
```
App start → Flyway checks `flyway_schema_history` table
         → Runs pending migrations in order (V1 → V2 → V3...)
         → JPA ddl-auto: validate — ensures entities match DB schema
         → App starts only if schema matches
```

---

## CI/CD Pipeline Design

### Repository Structure
```
TravelProject/
├── .github/
│   └── workflows/              (GitHub Actions)
│       ├── ci.yml              (build + test + lint)
│       └── deploy.yml          (Docker build + push + deploy)
├── docker-compose.yml          (local dev)
├── docker-compose.prod.yml     (production — multi-tenant envs)
├── user-service/
├── trip-service/
├── ai-service/
├── notification-service/
├── api-gateway/
└── frontend/
```

### CI Pipeline (ci.yml)
```
Trigger: push to main / PR to main

Steps:
  1. Checkout code
  2. Build all services (mvn package)
  3. Build frontend (npm ci + npm run build)
  4. Run tests (mvn test + npm test)
  5. Lint check
  6. Build Docker images (docker build)
  7. Push images to Docker Hub / ECR / GHCR
```

### CD Pipeline (deploy.yml)
```
Trigger: push to main / manual trigger

Steps:
  1. Pull latest images
  2. Run migrations (flyway migrate)
     - user-service: V1
     - trip-service: V1, V2, V3...
  3. Deploy services in order:
     - postgres + redis + kafka (infra first)
     - user-service + notification-service
     - ai-service
     - trip-service
     - api-gateway (last — routing)
     - frontend
  4. Health check (wait for 200 OK)
  5. Deploy success notification
```

### Migration Strategy in CI/CD
```bash
# Step 1: Database already running (external RDS/CloudSQL)
# Step 2: Run Flyway migrate BEFORE deploying new app version
docker run --rm \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://... \
  -e SPRING_DATASOURCE_USERNAME=... \
  -e SPRING_DATASOURCE_PASSWORD=... \
  myregistry/user-service:latest \
  java -jar app.jar --spring.flyway.enabled=true --spring.jpa.hibernate.ddl-auto=validate
# This runs only Flyway migration, app starts only if schema matches

# Step 3: Deploy actual services
docker compose -f docker-compose.prod.yml up -d
```

### Docker Production Compose
```yaml
# docker-compose.prod.yml (key highlights)
services:
  user-service:
    image: myregistry/user-service:latest
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_FLYWAY_ENABLED: "true"
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
    depends_on:
      postgres:
        condition: service_healthy
  
  trip-service:
    image: myregistry/trip-service:latest
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_FLYWAY_ENABLED: "true"
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
```

### Rollback Strategy
- **Schema rollback:** Nayi migration file banao (V4 for rollback of V3)
- **App rollback:** Previous Docker image deploy karo (old code + matching schema)
- **Hotfix:** Feature branch se bug fix → merge to main → CI/CD deploy

---

## Success Criteria — Kaise pata chalega kaam ho gaya?

| Phase | Success Criteria |
|---|---|
| Phase 1 | Naya agency register kare → tenant bane → uske users alag DB mein save hon |
| Phase 2 | Agency login kare → admin panel dekhe → logo + color change kare |
| Phase 3 | Agency ke customer website khole → agency ka logo + color dikhe |
| Phase 4 | Agency Stripe se pay kare → auto activate ho → welcome email aaye |
| Phase 5 | `manalitravels.com` type kare → branded app dikhe |
| Phase 6 | Agency apne customers ki trips dekh sake → data export kare |

---

## Revenue Model

| Tier | Price | Features |
|---|---|---|
| Starter | $199/mo | 1 agency, 3 sub-agents, 500 trips/mo, subdomain |
| Growth | $499/mo | 1 agency, 10 sub-agents, 2000 trips/mo, custom domain, priority support |
| Enterprise | Custom | Unlimited, dedicated server, SLA, on-prem, custom integrations |

**Cost per agency (estimated):** ~$5-10/mo (server + AI API calls)
**Profit per agency:** $189-494/mo
**Break-even:** 2-3 agencies

---

## Known Limitations & Future Enhancements

- **Phase 1-6 complete hone ke baad bhi yeh pending rahega:**
  - Real Gemini API (rootless Docker issue) — fallback currently works
  - Real email notifications (SMTP integration)
  - Distributed rate limiting (Redis-based instead of in-memory)
  - Leaflet interactive map (dependency already in package.json)

---

> **See [`ACHIEVEMENTS.md`](./ACHIEVEMENTS.md) for a complete log of everything built and achieved.**
