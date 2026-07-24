# TravelProject — HOW TO START & HOW IT WORKS

> **Purpose:** Single source of truth. Read this before touching anything.

---

## 1. Architecture (Simple View)

```
Browser ──> localhost:5173 ──> nginx or Vite proxy ──> API Gateway (port 8080/8090) ──> Services
```

**10 Docker containers running:**

| Container | Host Port | Internal Port | Talks To |
|-----------|-----------|---------------|----------|
| postgres | 5433 | 5432 | user-service, trip-service |
| redis | 6379 | 6379 | trip-service |
| zookeeper | 2181 | 2181 | kafka |
| kafka | 9092-9093 | 9092-9093 | all services |
| user-service | 8081 | 8081 | postgres |
| trip-service | 8082 | 8082 | postgres, redis, kafka |
| ai-service | 8083 | 8083 | kafka |
| notification-service | 8084 | 8084 | kafka |
| api-gateway | **8090** | **8080** | all services |
| frontend | 5173 | 80 | api-gateway |

---

## 2. How to Start (ALWAYS use this order)

### Step 1: Start infrastructure
```bash
docker compose up -d postgres redis zookeeper kafka
```

### Step 2: Start backend services
```bash
docker compose up -d user-service trip-service ai-service notification-service api-gateway
```

### Step 3: Start frontend
```bash
docker compose up -d frontend
```

### Step 4: Verify everything is healthy (wait 60s)
```bash
python3 -c "
import urllib.request, json

tests = [
    ('Frontend Home',       lambda: urllib.request.urlopen('http://localhost:5173/', timeout=5)),
    ('Manali Landing',      lambda: urllib.request.urlopen('http://localhost:5173/?tenant=manali', timeout=5)),
    ('Admin Login',         lambda: urllib.request.urlopen('http://localhost:5173/admin', timeout=5)),
    ('Branding API',        lambda: urllib.request.urlopen('http://localhost:5173/api/tenants/branding?subdomain=manali', timeout=5)),
    ('Gateway Direct',      lambda: urllib.request.urlopen('http://localhost:8090/api/tenants/branding?subdomain=manali', timeout=5)),
]

for name, fn in tests:
    try:
        resp = fn()
        print(f'✅ {name} → {resp.status}')
    except Exception as e:
        print(f'❌ {name} → {e}')
"

# Admin login test
import urllib.request, json
data = json.dumps({'email':'admin@manali.com','password':'password123'}).encode()
req = urllib.request.Request('http://localhost:5173/api/tenants/login', data=data, method='POST', headers={'Content-Type':'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=5)
    print(f'✅ Admin Login → {resp.status}')
except Exception as e:
    print(f'❌ Admin Login → {e}')
```

### All-In-One Command
```bash
docker compose up -d && sleep 15 && echo "Check http://localhost:5173/"
```

---

## 3. The TWO Frontend Modes (CRITICAL — Know This)

There are **two ways** the frontend runs. They use port 5173 for both. **Never run both at the same time.**

### Mode A: Docker (PRODUCTION — Use This)
```bash
docker compose up -d frontend
```
- Frontend is **built static files** served by **nginx** inside the container
- API calls flow: `Browser → nginx (port 5173) → nginx proxy_pass → api-gateway:8080`
- Config file: `frontend/nginx.conf`
- **No hot reload** — code changes need `docker compose build frontend && docker compose up -d frontend`

### Mode B: npm run dev (DEVELOPMENT — For Coding)
```bash
cd frontend && npm run dev
```
- Frontend runs via **Vite dev server** with hot reload
- API calls flow: `Browser → Vite proxy → localhost:8090`
- Config file: `frontend/vite.config.js`
- **Hot reload enabled** — code changes reflect instantly

### ⚠️ CRITICAL RULE: Never run both simultaneously
Both use port 5173. If Docker frontend is up, kill it first:
```bash
docker compose stop frontend
```
Then run `npm run dev`. When done, restart Docker frontend:
```bash
docker compose up -d frontend
```

### Why Two Different Proxies?

| Setting | Docker (nginx.conf) | npm run dev (vite.config.js) |
|---------|-------------------|---------------------------|
| Target | `http://api-gateway:8080` | `http://localhost:8090` |
| Why? | Inside Docker network, gateway is at port 8080 | On host machine, gateway is at port 8090 (mapped from 8080) |
| Config | `proxy_pass http://api-gateway:8080;` | `target: 'http://localhost:8090'` |

**The port difference is intentional:**
- Docker internal: `api-gateway:8080` (service name + internal port)
- Host: `localhost:8090` (Docker maps `8090 → 8080`)

---

## 4. How the Multi-Tenant Flow Works

```
User visits http://localhost:5173/
  │
  ├── No ?tenant param → PlatformLanding (SaaS homepage)
  │     └── "Register Agency" button → modal form
  │           ├── Fields: Agency Name, Email, Password, Subdomain
  │           └── POST /api/tenants/register
  │                 ├── Creates tenant in DB
  │                 ├── Creates admin user
  │                 └── Returns { tenantId, token, subdomain }
  │                       ├── Success modal shows:
  │                       │   ├── Customer Portal: http://{subdomain}.localhost:5173/?tenant={subdomain}
  │                       │   └── Admin Panel: http://{subdomain}.localhost:5173/admin
  │                       └── Auto-redirects to /admin/overview (4s delay)
  │
  ├── Has ?tenant=manali → TenantProvider detects param
  │     └── GET /api/tenants/branding?subdomain=manali
  │           ├── Returns { primaryColor, accentColor, logoUrl, tagline, etc. }
  │           └── ThemeProvider injects CSS vars → branded LandingPage
  │
  └── /admin → AdminLogin
        └── Admin enters email + password
              └── POST /api/tenants/login
                    └── Returns JWT with tenantId → localStorage
                          └── Redirect to /admin/overview
                                ├── /admin/branding → customize colors, logo, bg
                                ├── /admin/users → see customer list
                                └── /admin/billing → plan details
```

### Tenant Detection Logic (frontend/src/context/TenantProvider.jsx)
1. If authenticated (has JWT token) → use `tenant_id` from localStorage
2. Else → check URL param `?tenant=xxx`
3. Else → if not localhost, extract subdomain from hostname
4. Else → no tenant (show PlatformLanding)

---

## 5. API Gateway Routes

| Path Prefix | Routes To | Auth Required |
|-------------|-----------|---------------|
| `/api/tenants/**` | trip-service:8082 | No (branding is public) |
| `/api/auth/**` | user-service:8081 | No (register/login) |
| `/api/trips/**` | trip-service:8082 | Yes (JWT) |
| `/api/super/**` | trip-service:8082 | No (login), Yes (rest) |
| `/api/ai/**` | ai-service:8083 | No |
| `/api/billing/**` | trip-service:8082 | Yes (admin token) |
| `/uploads/**` | trip-service:8082 | No |
| `/api/ai/weather**` | ai-service:8083 | No |

---

## 6. Port Reference (Quick Lookup)

| Service | Docker Internal URL | Host URL |
|---------|-------------------|----------|
| PostgreSQL | `postgres:5432` | `localhost:5433` |
| Redis | `redis:6379` | `localhost:6379` |
| Kafka | `kafka:9092` | `localhost:9092` |
| user-service | `user-service:8081` | `localhost:8081` |
| trip-service | `trip-service:8082` | `localhost:8082` |
| ai-service | `ai-service:8083` | `localhost:8083` |
| notification-service | `notification-service:8084` | `localhost:8084` |
| api-gateway | `api-gateway:8080` | `localhost:8090` |
| frontend | `frontend:80` | `localhost:5173` |

---

## 7. Common Problems & Fixes

### Problem: Gemini/Weather API calls fail from inside Docker (rootless Docker)
**Root cause:** `host.docker.internal` doesn't resolve on Linux rootless Docker.

**Fix:** The docker-compose.yml already includes `extra_hosts: - "host.docker.internal:host-gateway"` for the ai-service. Just run the API proxy on your host:

```bash
# Start the API proxy (handles both Gemini and Weather API calls)
# This allows containers to reach external APIs through your host
cd /home/jitender/Desktop/TravelProject
source .env && python3 api-proxy.py 3090
# Keep this running in a separate terminal

# Then start the containers
docker compose up -d
```

The proxy will:
- Receive requests from ai-service at `host.docker.internal:3090`
- Add your GEMINI_API_KEY or WEATHER_API_KEY from .env
- Forward to the real APIs

### Problem: Frontend shows blank page or API calls fail
**Check:** Is the API proxy working?
```bash
curl http://localhost:5173/api/tenants/branding?subdomain=manali
# Should return 200 with JSON
```
**Fix:**
```bash
# Rebuild frontend with latest code + restart
cd frontend && npm run build && cd ..
docker compose build frontend && docker compose up -d frontend
```

### Problem: "port 5173 already in use"
**Fix:** Either stop Docker frontend or stop npm run dev — never both.
```bash
# Kill npm dev
pkill -f "vite"

# Or stop Docker frontend
docker compose stop frontend
```

### Problem: API returns 500 "Invalid UUID string: manali"
**Fix:** You passed `X-Tenant-Id: manali` instead of using `?subdomain=manali`. The branding API expects `?subdomain=` param for non-UUID lookups.

### Problem: After code changes, frontend still shows old UI
**Fix:** The Docker frontend serves built files. Rebuild needed:
```bash
cd frontend && npm run build && cd ..
docker compose build frontend && docker compose up -d frontend
```

### Problem: Containers keep restarting
**Check logs:**
```bash
docker compose logs user-service --tail 30
docker compose logs trip-service --tail 30
```

---

## 8. Verification Checklist (for "locking" a feature)

Before declaring "this feature is locked":
- [ ] `docker compose ps` — all 10 containers `Up`
- [ ] `http://localhost:5173/` — PlatformLanding loads
- [ ] `http://localhost:5173/?tenant=manali` — Manali branded page loads
- [ ] `http://localhost:5173/admin` — Admin login form shows
- [ ] Branding API via frontend: `http://localhost:5173/api/tenants/branding?subdomain=manali` → 200
- [ ] Admin login: `POST /api/tenants/login` with admin@manali.com / password123 → 200 + JWT
- [ ] Frontend nginx.conf has correct port: `docker exec travel-frontend cat /etc/nginx/conf.d/default.conf | grep proxy_pass` → shows `api-gateway:8080`

---

## 9. Quick Start for Dummies

```bash
# 1. Go to project
cd /home/jitender/Desktop/TravelProject

# 2. Start the API proxy (needed for rootless Docker to call external APIs)
# This runs in the background - keep terminal open or use nohup
source .env && nohup python3 api-proxy.py 3090 > proxy.log 2>&1 &

# 3. Start everything
docker compose up -d

# 4. Wait 60 seconds for all services
sleep 60

# 5. Open browser
echo "Open http://localhost:5173/ in your browser"
echo "For tenant demo: http://localhost:5173/?tenant=manali"

# 6. To see logs
docker compose logs -f

# 7. To stop the proxy when done
pkill -f "api-proxy.py"
```

---

## 10. Registered Tenants & Credentials

| Tenant | Subdomain | Admin Email | Admin Password | Customer URL | Admin URL |
|--------|-----------|-------------|---------------|--------------|-----------|
| Manali Travels | manali | admin@manali.com | password123 | http://manali.localhost:5173/ | http://manali.localhost:5173/admin |
| Test Agency | testagency | test@testagency.com | test123456 | http://testagency.localhost:5173/ | http://testagency.localhost:5173/admin |
| seema | seema | seema@gmail.com | seema123 | http://seema.localhost:5173/ | http://seema.localhost:5173/admin |
| Japan Travels | Japan | Japan123@gmail.com | ? | http://japan.localhost:5173/ | http://japan.localhost:5173/admin |
| (your agency) | Sardar | jitender22@gmail.com | ? | http://sardar.localhost:5173/ | http://sardar.localhost:5173/admin |

### How to Use Subdomain URLs
1. Open browser and go to `http://seema.localhost:5173/`
2. You'll see the branded landing page for seema (logo, bg image, colors)
3. Go to `http://seema.localhost:5173/admin` to login as admin
4. Use email: `seema@gmail.com`, password: `seema123`
5. After login, you'll be at `/admin/overview`
6. Go to `/admin/branding` to customize colors, logo, background

---

## 11. Environment Variables

These go in `.env` at the project root:

| Variable | Required | Default | Where Used | How to Get |
|----------|----------|---------|------------|------------|
| `GEMINI_API_KEY` | AI features | `placeholder-key` | ai-service → GeminiService | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `STRIPE_SECRET_KEY` | Billing | `sk_test_placeholder` | trip-service → BillingService | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Billing webhooks | `whsec_placeholder` | trip-service → BillingService | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |
| `WEATHER_API_KEY` | Weather | `placeholder-key` | ai-service → WeatherService | [OpenWeatherMap](https://openweathermap.org/api) (free) |

**Development mode:** All services work without any API keys — they fall back to mock data. To enable real APIs:

```bash
# Edit .env file
echo "GEMINI_API_KEY=your_actual_key" >> .env
echo "STRIPE_SECRET_KEY=sk_test_xxxx" >> .env
echo "WEATHER_API_KEY=your_weather_key" >> .env

# Then restart
docker compose up -d
```

**Gemini API:** The ai-service already has `GEMINI_API_KEY` configured via env var. When you provide a real key, the fallback mock itineraries are replaced with AI-generated ones. No code changes needed.

**Stripe:** When `STRIPE_SECRET_KEY` starts with `sk_test_` (valid key), dev mode turns off and real Stripe checkout sessions are created. Without it, subscription upgrades work in dev mode (immediate mock upgrade).

**Weather:** OpenWeatherMap free tier gives real-time weather. The existing WeatherService maps Indian destinations (Goa, Manali, Ladakh → Leh, etc.) to their city names for accurate results.

---

## 12. LOCKED — Frozen Feature State

As of July 3, 2026, this system is **LOCKED**. Do not modify these files without explicit approval:

### Critical Config Files (Never touch unless you know why)
| File | Why |
|------|-----|
| `frontend/nginx.conf` | proxy_pass MUST be `api-gateway:8080` (not `:8090`) |
| `docker-compose.yml` | All port mappings, service dependencies |
| `frontend/vite.config.js` | Dev proxy target MUST be `localhost:8090` |
| `frontend/src/context/TenantProvider.jsx` | Subdomain detection logic |

### One Way to Run — Docker Only
```bash
# ALWAYS use this (NEVER mix npm run dev with Docker)
docker compose up -d
```

### If you need to develop (hot reload):
```bash
# 1. Stop Docker frontend first
docker compose stop frontend

# 2. Run Vite dev server
cd frontend && npm run dev

# 3. When done, kill npm dev (Ctrl+C) and restart Docker
docker compose up -d frontend
```

### Verification commands (run these to confirm lock is solid):
```bash
# Check nginx port
docker exec travel-frontend cat /etc/nginx/conf.d/default.conf | grep proxy_pass
# Should show: proxy_pass http://api-gateway:8080;

# Check all containers are up
docker compose ps | grep -c "Up"
# Should show: 10

# Test branding API
curl http://localhost:5173/api/tenants/branding?subdomain=seema
# Should return 200 with JSON
```
