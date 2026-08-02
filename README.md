# WhiteLabel Travel Application

A white-label, multi-tenant AI travel planning SaaS platform. Travel agencies subscribe, and their customers get a fully branded website that generates AI-powered itineraries in seconds.

Built as a microservices system: 5 Spring Boot services behind an API Gateway, a React frontend with dynamic per-tenant theming, PostgreSQL for data, Redis for caching, and Kafka for the asynchronous AI pipeline.

---

## Key Features

- **White-label multi-tenancy** — one codebase powers every agency. Each agency gets a branded customer portal + admin panel (logo, colors, background, overlay, template).
- **AI itinerary generation** — async pipeline via Kafka. Trip creation returns instantly; Gemini generates the itinerary in the background and the frontend polls for status.
- **Agency self-service admin panel** — register your agency, manage branding, customers, billing, destinations and places.
- **Super admin platform** — manage all tenants, plans, and statuses from one dashboard.
- **JWT authentication** — signed tokens with `tenantId` claims; the gateway validates and injects tenant context to downstream services.
- **Per-tenant caching & rate limiting** — Redis for cached itineraries, bucket4j token-bucket rate limiting.
- **Dynamic destination & place management** — agencies curate destinations and places shown to their customers.
- **Billing foundation** — Stripe integration, pricing plans, subscription status on tenants.
- **PDF trip exports** — white-label PDF generation with agency branding (iText 7).
- **Swagger API docs** — every service documented and aggregated into one Swagger UI at the gateway.

---

## Architecture

```
Browser (React, port 5173)
        |
        v
   API Gateway (Spring Cloud Gateway, port 8090)
   |  routes /api/**  |  validates JWT  |  injects X-Tenant-Id + X-User-Id
   |
   +-- user-service  (:8081)  JWT auth, user CRUD, avatars
   +-- trip-service  (:8082)  trips, budgets, tenants, branding, billing, PDF
   +-- ai-service    (:8083)  Gemini itinerary generation (Kafka consumer)
   +-- notification-service (:8084)  email notifications (Kafka consumer)
   |
   PostgreSQL (shared, tenant_id on every table)
   Redis     (per-tenant cache)
   Kafka     (trip-events topic: async AI pipeline)
```

### How a trip is generated (async)

```
1. POST /api/trips/create  ->  trip-service saves Trip (status=PENDING)
2. trip-service publishes TripEvent -> Kafka topic "trip-events"
3. ai-service consumes, calls Gemini, generates itinerary, updates status
4. Frontend polls GET /api/trips/{id}/status until COMPLETED
```

Why async? Gemini calls take 10-30s. Kafka gives durability + retries + independent scaling of the AI service.

### Multi-tenancy model

Shared database, every row tagged with `tenant_id`. A servlet filter (`TenantFilter`) reads the tenant from the `X-Tenant-Id` header set by the gateway, stores it in a `ThreadLocal` (`TenantContext`), and every service-layer query filters by it. The JWT itself carries `tenantId`, so downstream services never trust a raw client header for scoping.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.3.1, Spring Cloud Gateway, Spring Data JPA, Spring Security |
| Frontend | React 18, Vite 5, Tailwind CSS, React Router, Framer Motion, Leaflet, Recharts, jsPDF |
| Data | PostgreSQL 16, Redis, Flyway migrations, bucket4j |
| Async | Apache Kafka + Zookeeper |
| Payments | Stripe |
| PDF | iText 7 |
| Auth | JWT (jjwt, HS384) |
| Infra | Docker, Docker Compose |
| API Docs | springdoc-openapi (Swagger UI) |

---

## Getting Started

### Option A: Docker (everything)

```bash
docker compose up -d          # builds and starts all 8 containers
```

Wait ~60s, then open http://localhost:5173

### Option B: Local development

Infrastructure:

```bash
docker compose up -d postgres redis kafka
```

Services (each in its own terminal):

```bash
# api-gateway (port 8090)
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8090

# user-service (8081)
./mvnw spring-boot:run

# trip-service (8082)
./mvnw spring-boot:run

# ai-service (8083) - requires Kafka + Gemini
./mvnw spring-boot:run

# frontend (5173)
cd frontend && npm install && npm run dev
```

> Note: the frontend Vite dev proxy targets `http://localhost:8090` for `/api` calls, so run the gateway on 8090 locally (as above). In Docker, the gateway is internally on 8080 and exposed on 8090.

---

## Services & Ports

| Service | Port | Description |
|---|---|---|
| Frontend | 5173 | React SPA (nginx in Docker) |
| api-gateway | 8090 (external) / 8080 (internal) | Routing, JWT validation, tenant injection |
| user-service | 8081 | Auth, registration, login, profile |
| trip-service | 8082 | Trips, tenants, branding, billing, PDF |
| ai-service | 8083 | Gemini itinerary generation |
| notification-service | 8084 | Email notifications |
| PostgreSQL | 5433 (external) | Shared DB: `travel_user_db`, `travel_trip_db` |
| Redis | 6379 | Per-tenant cache |
| Kafka | 9092 | Async messaging (`trip-events` topic) |

---

## API Documentation (Swagger)

springdoc-openapi is configured on every REST service, and the gateway aggregates all specs into a single Swagger UI:

| URL | Description |
|---|---|
| http://localhost:8090/swagger-ui.html | All services in one UI |
| http://localhost:8081/swagger-ui.html | User Service |
| http://localhost:8082/swagger-ui.html | Trip Service |
| http://localhost:8083/swagger-ui.html | AI Service |

- Use the **Authorize** button to paste a JWT for protected endpoints.
- Tenant-aware endpoints need the `X-Tenant-Id` header.

### Key endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/tenants/register` | No | Register an agency (creates tenant + admin) |
| POST | `/api/tenants/login` | No | Agency admin login |
| POST | `/api/tenants/branding` | Admin | Update branding (colors, logo, bg, overlay) |
| POST | `/api/auth/register` | No | Register a customer |
| POST | `/api/auth/login` | No | Customer login |
| POST | `/api/trips/create` | JWT | Create a trip (returns immediately, async AI) |
| GET | `/api/trips/{id}/status` | JWT | Poll trip status |
| GET | `/api/trips/search?keyword=` | JWT | Search trips |
| POST | `/api/trips/compare` | JWT | Compare destinations |
| POST | `/api/super/login` | No | Super admin login |
| GET | `/api/super/tenants` | Super | List all tenants |
| GET | `/api/super/stats` | Super | Platform analytics |

---

## Demo Credentials

| Role | Email | Password | Login |
|---|---|---|---|
| Super Admin | `admin@travelplanner.com` | `admin123` | `/super-admin/login` |
| Agency Admin | self-registered | self-registered | `/admin` |

Demo tenants can be viewed by appending the subdomain: `http://localhost:5173/?tenant=manali` (after registering that agency).

---

## Project Structure

```
├── api-gateway/          Spring Cloud Gateway (routing, JWT, tenant injection)
├── user-service/         Auth, users, avatars
├── trip-service/         Trips, tenants, branding, billing, PDF, Flyway migrations
├── ai-service/           Gemini consumer + weather
├── notification-service/ Kafka consumer for emails
├── frontend/             React SPA with dynamic tenant theming
├── docker/               DB init scripts
└── docker-compose.yml    8-container stack
```

---

## Roadmap

- Real Gemini API key integration (currently runs behind a host proxy / demo mode)
- Redis-backed distributed rate limiting
- Idempotent Kafka consumers (at-least-once handling)
- CI/CD with automated deploy (GitHub Actions + Docker + Flyway migrate)
- Observability: Micrometer/Prometheus metrics + distributed tracing
- WebSocket/SSE status updates instead of polling
- Automated cross-tenant isolation test suite
