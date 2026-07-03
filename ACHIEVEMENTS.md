# TravelProject — Achievements & Progress

## Project Overview
White-label multi-tenant AI travel planning platform.
One codebase powers all agencies — each gets branded customer portal + admin panel.

---

## ✅ Backend Infrastructure

### Docker Stack (8 containers)
| Service | Port | Purpose |
|---|---|---|
| PostgreSQL | 5433 | Main database (travel_user_db, travel_trip_db) |
| Redis | 6379 | Per-tenant cache |
| Kafka + Zookeeper | 9092-9093 | Async messaging |
| user-service | 8081 | JWT auth, user CRUD, tenant-aware |
| trip-service | 8082 | Trip CRUD, tenant entity, branding, Redis rate limiting |
| ai-service | 8083 | Gemini AI consumer |
| api-gateway | 8090 | Tenant header injection, route to services |

### Multi-Tenant Foundation
- Tenant entity + repository (findByDomain, findBySubdomainIgnoreCase)
- tenant_id column on users, trips, trip_budget, trip_comparison tables
- TenantContext (ThreadLocal) + TenantFilter (servlet filter reading X-Tenant-Id / X-Tenant-Domain)
- All service-layer queries filtered by tenant_id
- JWT includes tenant_id claim
- API Gateway injects X-Tenant-Id header to downstream services

### Flyway Migrations
| Migration | Purpose |
|---|---|
| V1 | Create trip tables (trips, trip_budget, trip_comparison) |
| V2 | Create tenants table |
| V3 | Add tenant_id columns to existing tables |
| V4 | Add adminEmail + adminPassword to tenants (BCrypt) |
| V5 | Add background_image + template_style to tenants |
| V6 | Add overlay_opacity + overlay_blur to tenants |
| V7 | Create super_admins table |
| V8 | Add orb_intensity column (created but frontend reverted) |

### Centralized Exception Handling
- `@RestControllerAdvice` — no try-catch in any controller
- Custom exceptions (TenantNotFoundException, UnauthorizedException, etc.)
- Clean ErrorResponse DTO

---

## ✅ User & Auth System
- Register/login with tenant scope
- JWT with tenantId claim
- SecurityConfig with TenantFilter registration
- Demo mode for quick testing

---

## ✅ Admin Panel (Agency Self-Service)

### API Endpoints
- `POST /api/tenants/register` — register new agency (creates tenant + admin user)
- `POST /api/tenants/admin-login` — admin login with email/password
- `GET /api/tenants/branding` — fetch branding config (public, domain-based)
- `PUT /api/tenants/branding` — update branding (colors, logo URL, background, overlay, template)
- `POST /api/tenants/logo` — multipart logo upload to uploads/logos/

### Frontend Pages
| Page | Route | Description |
|---|---|---|
| AdminLogin | `/admin` | Admin login with email/password |
| AdminOverview | `/admin/overview` | Dashboard with users, trips, usage stats |
| BrandingSetup | `/admin/branding` | Logo upload, color pickers, bg image, overlay, template, live preview |
| CustomerList | `/admin/users` | List of tenant's customers |
| BillingPage | `/admin/billing` | Plan details, invoice history |

### Branding System (Per-Tenant)
- Primary color + accent color (hex)
- Logo image upload (stored on filesystem, served via Vite proxy)
- Background image URL
- Overlay opacity (0-100%) + blur (none/sm/md/lg)
- Template style (modern/classic/minimal/adventure)
- Tagline displayed on landing page

---

## ✅ Super Admin Panel

### Backend
- SuperAdmin entity + repository + controller (`/api/super/*`)
- Flyway V7 with default credentials seeded
- Default: `admin@travelplanner.com` / `super123`

### Frontend Pages
| Page | Route | Description |
|---|---|---|
| SuperAdminLogin | `/super-admin/login` | Separate login for super admin |
| SuperAdminDashboard | `/super-admin/dashboard` | All tenants overview |
| SuperTenants | `/super-admin/tenants` | Manage all tenants |
| SuperTenantDetail | `/super-admin/tenants/:id` | View/edit single tenant |

---

## ✅ Frontend Theme & Branding

### Dynamic Theming
- TenantProvider detects tenant from URL (`?tenant=`), subdomain, or JWT
- Fetches branding from `GET /api/tenants/branding`
- ThemeProvider injects `<style>` tag with direct hex CSS overrides for ALL utility classes (text, bg, border, gradient, shadow, ring, hover variants)
- All customer-facing pages reflect tenant colors on buttons, links, badges, gradients

### Pages
| Page | Route | Description |
|---|---|---|
| PlatformLanding | `/` (no tenant) | SaaS website — hero, features, pricing, screenshots, registration modal |
| LandingPage | `/` (with tenant) | Tenant-branded customer landing with bg image, overlay, orbs |
| HomePage | `/` | Router: PlatformLanding or LandingPage based on tenant detection |
| Login | `/login` | Branded login with bg image, overlay, glass card |
| Register | `/register` | Branded registration with bg image, overlay, glass card |
| Dashboard | `/dashboard` | Trip management with search recommendations |
| PricingPage | `/pricing` | Pricing plans |
| WhiteLabelDemo | `/whitelabel-demo` | Live preview of branding system |

### CSS & Animations
- Custom animations: `pulse-soft`, `bounce-gentle`, `scale-in`, `spin-slow`
- Glass morphism utilities: `glass-strong`, `card-lift`
- Text effects: `gradient-text-glow`, `shimmer`
- dot-grid background pattern
- Custom scrollbar styling
- `::selection` styling

### Orb / Glow System
- Floating gradient orbs on LandingPage, Login, Register
- **Hidden automatically when tenant has a background image** (prevents visual clutter)
- Static Tailwind opacity classes (`bg-primary-500/10`, `bg-accent-500/8`)

---

## ✅ Key Features Delivered

### Agency Registration Flow
1. Agency fills form on PlatformLanding modal
2. Backend creates tenant + admin user
3. Customer portal URL + admin panel URL shown in success modal
4. Admin redirects to `/admin/overview`

### URL Display
- Customer portal: `http://{subdomain}.localhost:5173/`
- Admin panel: `http://{subdomain}.localhost:5173/admin`

### BrandingSetup Live Preview
- Shows background image with overlay opacity + blur
- Primary/accent colors on buttons, gradient bar, tagline card
- Orb gradient backgrounds matching tenant colors
- Template style name + blur level label

### Button Color Theming (Reliable)
- ThemeProvider injects `<style>` tag with direct hex `!important` overrides
- Covers `btn-primary`, `text-primary-*`, `bg-primary-*`, `border-primary-*`, `from-primary-*`, `to-primary-*`, `ring-primary-*`, `shadow-primary-*` and all `*-accent-*` variants
- Also covers hover states (`hover:bg-primary-`, `hover:text-primary-`, etc.)
- Index.css rewritten to avoid `@apply` with opacity modifiers on CSS variable colors

### Case-Insensitive Subdomain
- `findBySubdomainIgnoreCase()` in TenantRepository
- Manali Travels = `manali`, `Manali`, `MANALI` all resolve correctly

### Demo / Test
- `?tenant=manali` — Manali Travels branding
- `?tenant=japan` — Japan Travels branding
- `?tenant=goa` — Goa Travels branding
- Default domain → TravelPlanner branding

---

## ✅ Bug Fixes & Polish
- `className="input"` → `className="input-field"` in all pages
- Removed `res.data.token` access (adminService stores token internally)
- `trip-uploads` volume mount for logo persistence across restarts
- Login/Register orbs already had `!backgroundImage` guard (before global fix)
- Register inner visual panel orbs also guarded against background image
- LandingPage both animated background + floating orbs guarded
- Orb brightness feature reverted (V8 column exists but frontend uses fixed opacity)

---

## 📋 Remaining Work (Future Phases)

### Phase 4: Billing & Subscription
- Stripe integration (webhook, subscription creation)
- Tenant activation flow on payment success
- Pricing page live data

### Phase 5: DNS & Domain Setup
- Wildcard subdomain routing
- Custom domain support with CNAME
- SSL cert auto-provision

### Phase 6: Advanced Agency Features
- Usage analytics dashboard
- Customer management with data export
- White-label PDF (trip export with agency branding)
- Multi-language i18n support

### Other Backlog
- Real Gemini API integration (rootless Docker issue)
- Real email notifications (SMTP)
- Distributed rate limiting (Redis-based)
- Leaflet interactive map
- End-to-end multi-tenant data isolation verification
- Agency-side customer registration/login flow
- Customer trip planning features (create trip → AI itinerary → view)
