# Software Requirements Specification (SRS)
## AI-Powered Travel Planning Platform

---

## 1. Introduction

### 1.1 Purpose
This document defines the software requirements for an AI-powered travel planning platform that allows users to create trips, receive AI-generated itineraries, compare travel plans, and manage their travel budgets.

### 1.2 Scope
The system is a full-stack web application with microservices architecture. Users can register, log in, create trips with destination/budget/duration/mood, receive AI-generated day-wise itineraries with budget breakdowns, compare different plan types (budget/luxury/adventure), and export trip details as PDF.

### 1.3 Technology Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion |
| Backend | Spring Boot 3.3, Java 21, Spring Cloud Gateway |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Message Broker | Apache Kafka 7.5 + Zookeeper |
| AI Integration | Google Gemini 1.5 Flash API |
| Weather | OpenWeatherMap API |
| Containerization | Docker, Docker Compose |
| Authentication | JWT (BCrypt hashing) |
| Rate Limiting | Bucket4j |

---

## 2. Functional Requirements

### 2.1 User Management (User Service)

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Users shall register with name, email, and password | High |
| FR-02 | Password shall be stored using BCrypt hashing | High |
| FR-03 | Users shall log in with email and password | High |
| FR-04 | System shall return a JWT token upon successful login | High |
| FR-05 | JWT token shall expire after 24 hours | High |
| FR-06 | Email shall be unique across all users | High |

### 2.2 Trip Management (Trip Service)

| ID | Requirement | Priority |
|---|---|---|
| FR-07 | Authenticated users shall create a trip with destination, budget, days, travel type, and optional mood description | High |
| FR-08 | Trip shall be created with status PENDING then immediately changed to GENERATING | High |
| FR-09 | Users shall view all their trips | High |
| FR-10 | Users shall view a single trip with full details | High |
| FR-11 | Users shall delete their trips | High |
| FR-12 | Users shall view trip status (PENDING/GENERATING/COMPLETED/FAILED) | High |
| FR-13 | Trip data shall be cached in Redis for faster reads | Medium |
| FR-14 | Users shall see whether data was served from cache | Low |
| FR-15 | System shall enforce rate limiting of 20 requests per minute per user | Medium |

### 2.3 AI Itinerary Generation (AI Service)

| ID | Requirement | Priority |
|---|---|---|
| FR-16 | System shall consume TRIP_CREATED Kafka event and generate a day-wise itinerary using Gemini AI | High |
| FR-17 | Itinerary shall include daily activities, estimated costs, and recommendations | High |
| FR-18 | System shall generate a budget breakdown (hotel/food/transport/activities/misc) | High |
| FR-19 | System shall fetch weather summary for the destination | Medium |
| FR-20 | Mood description shall be sent to Gemini for personalized recommendations | Medium |
| FR-21 | On Gemini API failure, system shall generate a fallback template itinerary | Medium |
| FR-22 | On weather API failure, system shall use seasonal weather summary | Low |
| FR-23 | Trip status shall be updated to COMPLETED after AI processing | High |
| FR-24 | Trip status shall be updated to FAILED if AI processing errors out | High |
| FR-25 | System shall consume TRIP_REPLAN event and regenerate itinerary with instructions | Medium |
| FR-26 | System shall consume COMPARE_REQUESTED event and generate 3 plan types (budget/luxury/adventure) | Medium |

### 2.4 Trip Comparison

| ID | Requirement | Priority |
|---|---|---|
| FR-27 | Users shall compare budget, luxury, and adventure plans for the same destination | Medium |
| FR-28 | Comparison results shall be stored in trip_comparison table | Medium |
| FR-29 | Users shall view comparisons side-by-side | Medium |

### 2.5 Notifications (Notification Service)

| ID | Requirement | Priority |
|---|---|---|
| FR-30 | System shall consume TRIP_CREATED events and log notification | Low |
| FR-31 | System shall consume TRIP_COMPLETED events and log notification | Low |
| FR-32 | System shall consume TRIP_FAILED events and log notification | Low |

### 2.6 Dashboard & Analytics

| ID | Requirement | Priority |
|---|---|---|
| FR-33 | Dashboard shall display total trips, total budget, average trip cost, and completed trips | Medium |
| FR-34 | Dashboard shall display cache performance statistics | Low |
| FR-35 | Dashboard shall display popular destinations | Low |

### 2.7 PDF Export

| ID | Requirement | Priority |
|---|---|---|
| FR-36 | Users shall export trip details (itinerary, budget, weather) as PDF | Low |

### 2.8 Re-plan Feature

| ID | Requirement | Priority |
|---|---|---|
| FR-37 | Users shall provide modification instructions for an existing trip | Medium |
| FR-38 | System shall regenerate the itinerary incorporating the instructions | Medium |

---

## 3. Non-Functional Requirements

| ID | Requirement | Category |
|---|---|---|
| NFR-01 | System shall respond to API requests within 2 seconds (cached trips) | Performance |
| NFR-02 | System shall respond to API requests within 5 seconds (non-cached trips) | Performance |
| NFR-03 | AI itinerary generation may take up to 30 seconds (async) | Performance |
| NFR-04 | System shall handle at least 20 concurrent users | Scalability |
| NFR-05 | Passwords shall be hashed with BCrypt | Security |
| NFR-06 | JWT tokens shall be validated on every /api/trips/ request | Security |
| NFR-07 | Rate limiting shall block excessive requests (20 req/min/user) | Security |
| NFR-08 | All inter-service communication shall occur within Docker bridge network | Security |
| NFR-09 | System shall use Kafka for reliable async event processing | Reliability |
| NFR-10 | Redis cache shall reduce database load | Reliability |
| NFR-11 | UI shall be responsive and work on mobile devices | Usability |
| NFR-12 | Loading states shall be shown during async trip generation | Usability |
| NFR-13 | The frontend shall be built with React 18 and Vite 5 | Maintainability |
| NFR-14 | Backend services shall follow microservices architecture | Maintainability |

---

## 4. System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌────────────────┐
│   Browser   │ ───→ │ API Gateway  │ ───→ │  User Service  │ ←→ PostgreSQL
│ (React SPA) │      │ (port 8080)  │      │  (port 8081)   │
└─────────────┘      └──────┬───────┘      └────────────────┘
                            │                      
                     ┌──────┴───────┐      ┌────────────────┐
                     │  Trip Service│ ───→ │   PostgreSQL   │
                     │  (port 8082) │ ←──→ │    Redis 7     │
                     └──────┬───────┘      └────────────────┘
                            │ Kafka (trip-events)
                     ┌──────┴───────┐      ┌────────────────┐
                     │   AI Service │ ───→ │  Gemini API    │
                     │  (port 8083) │ ───→ │ OpenWeatherMap │
                     └──────┬───────┘      └────────────────┘
                            │ Kafka (trip-events)
                     ┌──────┴───────┐
                     │ Notification │
                     │  (port 8084) │
                     └──────────────┘
```

---

## 5. Database Schema

### travel_user_db

**users**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(100) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL |
| created_at | DATETIME | NOT NULL |

### travel_trip_db

**trips**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| destination | VARCHAR(100) | NOT NULL |
| budget | DECIMAL(10,2) | NOT NULL |
| days | INT | NOT NULL |
| travel_type | VARCHAR(50) | NOT NULL |
| mood_description | TEXT | NULLABLE |
| trip_status | VARCHAR(30) | NULLABLE |
| weather_summary | TEXT | NULLABLE |
| cache_used | BOOLEAN | NULLABLE |
| total_estimated_cost | DECIMAL(10,2) | NULLABLE |
| itinerary | TEXT | NULLABLE |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' |
| created_at | DATETIME | NOT NULL |

**trip_budget**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| trip_id | UUID | FK → trips.id |
| hotel_cost | DECIMAL(10,2) | NULLABLE |
| food_cost | DECIMAL(10,2) | NULLABLE |
| transport_cost | DECIMAL(10,2) | NULLABLE |
| activity_cost | DECIMAL(10,2) | NULLABLE |
| misc_cost | DECIMAL(10,2) | NULLABLE |

**trip_comparison**
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| destination | VARCHAR(100) | NOT NULL |
| comparison_type | VARCHAR(50) | NOT NULL |
| itinerary | TEXT | NULLABLE |

---

## 6. API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and return JWT |

### Trips (Authenticated)
| Method | Path | Description |
|---|---|---|
| POST | /api/trips | Create trip (status → GENERATING) |
| GET | /api/trips | List user's trips |
| GET | /api/trips/{id} | Get trip details |
| DELETE | /api/trips/{id} | Delete trip |
| POST | /api/trips/{id}/replan | Re-plan with instructions |
| GET | /api/trips/compare/{destination} | Get comparison plans |
| GET | /api/trips/cache-stats | Cache analytics |

### AI (Authenticated)
| Method | Path | Description |
|---|---|---|
| POST | /api/ai/analyze-mood | Analyze mood description |

---

## 7. Event Schema (Kafka)

**Topic:** `trip-events`

| Event Type | Payload | Producer | Consumer |
|---|---|---|---|
| TRIP_CREATED | { tripId, userId } | Trip Service | AI Service, Notification |
| TRIP_REPLAN | { tripId, userId, instruction } | Trip Service | AI Service |
| COMPARE_REQUESTED | { userId, destination } | Trip Service | AI Service |
| TRIP_COMPLETED | { tripId, userId } | AI Service | Notification |
| TRIP_FAILED | { tripId, userId, error } | AI Service | Notification |

---

## 8. Trip Status Flow

```
PENDING → GENERATING → COMPLETED
                    → FAILED
```

---

## 9. Assumptions & Constraints

| # | Description |
|---|---|
| A1 | Gemini API requires internet access; fallback templates used in rootless Docker |
| A2 | Rate limiting is in-memory per container instance, not distributed via Redis |
| A3 | Weather API requires internet access; fallback seasonal data used |
| A4 | No real email/push notifications implemented — only console logging |
| A5 | JPA relationship annotations are not used; FKs are logical UUID columns |
| A6 | All services run on a single Docker bridge network (travel-network) |
