# UrbanThali Foods

<p align="center">
  <img src="docs/assets/urbanthali-banner.svg" alt="UrbanThali Foods Enterprise Platform Banner" width="100%" />
</p>

<p align="center">
  <strong>Enterprise Subscription-First Tiffin & Cloud Kitchen Operations Platform</strong>
  <br />
  <em>Scalable Monorepo powering Cross-Platform Mobile Apps, Operations Admin Web Portals, Kitchen Batching, Fleet Dispatch, and High-Performance APIs.</em>
</p>

<p align="center">
  <a href="#-system-architecture"><img src="https://img.shields.io/badge/Architecture-Modular%20Microservices-blue.svg?style=for-the-badge&logo=blueprint" alt="Architecture" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#-client-applications"><img src="https://img.shields.io/badge/React%20Native-Expo%2051-000000.svg?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
  <a href="#-client-applications"><img src="https://img.shields.io/badge/React-Vite%20Admin-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React Vite" /></a>
  <a href="#-backend-services"><img src="https://img.shields.io/badge/Node.js-Express%20v4-339933.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="#-data--infrastructure"><img src="https://img.shields.io/badge/PostgreSQL-Ready-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="#-data--infrastructure"><img src="https://img.shields.io/badge/Redis-Caching%20%26%20Queues-DC382D.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" /></a>
  <a href="#-enterprise-integrations"><img src="https://img.shields.io/badge/Razorpay%20%26%20Stripe-Payments-528FF0.svg?style=for-the-badge&logo=stripe&logoColor=white" alt="Payments" /></a>
  <a href="#-enterprise-integrations"><img src="https://img.shields.io/badge/Google%20Maps-Routes%20%26%20ETA-4285F4.svg?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Google Maps" /></a>
</p>

---

## 📌 Executive Summary & Platform Overview

**UrbanThali Foods** is an end-to-end cloud kitchen and scheduled meal delivery platform designed for high-density urban catering, corporate lunch subscriptions, and residential tiffin networks. Unlike standard ad-hoc food delivery apps, UrbanThali operates on a **predictable subscription model** that eliminates food waste, optimizes kitchen prep manifests hours in advance, clusters multi-order rider delivery routes, and guarantees on-time doorstep delivery.

### 💼 Business Value for Enterprises
* **Zero Food Waste Forecasting:** Automated daily delivery tickets generated from active recurring subscriptions ensure cloud kitchens prep exact meal counts.
* **Multi-Role Orchestration:** Dedicated operational workflows for **Customers**, **Kitchen Hub Partners**, **Fleet Delivery Riders**, and **Central Operations Admins**.
* **Smart Route Clustering & Live Tracking:** Automated route waypoint generation, live ETA computation, and simulated real-time GPS telemetry.
* **Enterprise Security & Compliance:** FSSAI cloud kitchen license tracking, OTP-secured delivery handovers, and role-based access control (RBAC).

---

## 📑 Table of Contents

- [UrbanThali Foods](#urbanthali-foods)
  - [📌 Executive Summary \& Platform Overview](#-executive-summary--platform-overview)
    - [💼 Business Value for Enterprises](#-business-value-for-enterprises)
  - [📑 Table of Contents](#-table-of-contents)
  - [🏛️ System Architecture](#️-system-architecture)
    - [Layered Architecture Diagram](#layered-architecture-diagram)
    - [Architectural Components Breakdown](#architectural-components-breakdown)
  - [👥 Multi-Role Enterprise Ecosystem](#-multi-role-enterprise-ecosystem)
    - [Role Domain Model](#role-domain-model)
    - [Stakeholder Responsibilities Matrix](#stakeholder-responsibilities-matrix)
  - [🔄 End-to-End Operational Workflows](#-end-to-end-operational-workflows)
    - [Daily Lifecycle: From Subscription to Doorstep](#daily-lifecycle-from-subscription-to-doorstep)
    - [Delivery State Machine](#delivery-state-machine)
  - [📂 Monorepo Structure](#-monorepo-structure)
    - [Workspaces Topology](#workspaces-topology)
  - [🚀 Quick Start Guide (\&lt; 5 Minutes)](#-quick-start-guide-5-minutes)
    - [1. Prerequisites](#1-prerequisites)
    - [2. Clone \& Install Dependencies](#2-clone--install-dependencies)
    - [3. Configure Environment Variables](#3-configure-environment-variables)
    - [4. Launch Workspaces](#4-launch-workspaces)
    - [5. Verify System Health](#5-verify-system-health)
  - [📡 Complete REST API Reference](#-complete-rest-api-reference)
    - [API Service Endpoints Summary](#api-service-endpoints-summary)
    - [1. Authentication Module (`/auth`)](#1-authentication-module-auth)
    - [2. Subscriptions Module (`/subscriptions`)](#2-subscriptions-module-subscriptions)
    - [3. Multi-Role Profiles Module (`/profiles`)](#3-multi-role-profiles-module-profiles)
    - [4. Deliveries \& Fleet Dispatch (`/deliveries`)](#4-deliveries--fleet-dispatch-deliveries)
    - [5. Navigation \& Routing (`/navigation`)](#5-navigation--routing-navigation)
    - [6. Payments Module (`/payments`)](#6-payments-module-payments)
    - [7. OTP Notifications Module (`/notifications`)](#7-otp-notifications-module-notifications)
    - [8. System Health Probes (`/health`)](#8-system-health-probes-health)
  - [🎛️ Operations \& Admin Runbook](#️-operations--admin-runbook)
    - [Cloud Kitchen Prep Runbook](#cloud-kitchen-prep-runbook)
    - [Rider Dispatch \& Fleet Tracking Runbook](#rider-dispatch--fleet-tracking-runbook)
    - [Customer Subscription Management Runbook](#customer-subscription-management-runbook)
    - [Default Sandbox Test Credentials](#default-sandbox-test-credentials)
  - [☁️ Cloud \& Production Deployment](#️-cloud--production-deployment)
    - [Production AWS Architecture](#production-aws-architecture)
    - [Environment Readiness Summary](#environment-readiness-summary)
  - [🔒 Security, Data Governance \& Compliance](#-security-data-governance--compliance)
  - [🗺️ Product Development Roadmap](#️-product-development-roadmap)
  - [📜 License \& Enterprise Support](#-license--enterprise-support)

---

## 🏛️ System Architecture

UrbanThali is architected as a **modular monorepo** with clean separation of concerns, strict TypeScript contracts, and cloud-native infrastructure readiness.

### Layered Architecture Diagram

```mermaid
flowchart TB
    subgraph Clients[" 📱 Client Applications Layer "]
        Mobile["📱 Mobile Application<br/><b>@urbanthali/mobile</b><br/><i>Cross-Platform (iOS & Android) via Expo / React Native</i>"]
        Admin["💻 Operations & Kitchen Portal<br/><b>@urbanthali/admin</b><br/><i>Enterprise Operations Dashboard via React 18 + Vite</i>"]
    end

    subgraph CoreBackend[" ⚡ API Gateway & Core Domain Services "]
        API["🚀 UrbanThali REST API<br/><b>@urbanthali/api</b><br/><i>Node.js + Express + TypeScript</i>"]
        Shared["📦 Domain Shared Contracts<br/><b>@urbanthali/shared</b><br/><i>Shared DTOs, Enums, Interfaces & Schemas</i>"]
        
        subgraph SubModules[" 🧩 Modular Business Services "]
            AuthMod["🔐 Identity & RBAC"]
            SubMod["📅 Subscription Engine"]
            KitchenMod["🍳 Kitchen Batch Manifests"]
            NavMod["🗺️ Waypoints & ETA"]
            DelivMod["🛵 Fleet Dispatch & Tracking"]
            PayMod["💳 Payment Processing"]
            ProfMod["👥 Profile Management"]
        end
    end

    subgraph DataQueue[" 💾 Data Persistence & Asynchronous Queues "]
        PG[("🐘 PostgreSQL<br/><i>Primary Relational Storage</i><br/>Profiles, Orders, Subscriptions")]
        Redis[("⚡ Redis Cache<br/><i>Session State & Live Telemetry</i>")]
        Queue["📬 BullMQ / AWS SQS<br/><i>Daily Manifest & Notification Workers</i>"]
    end

    subgraph ExternalServices[" 🌐 Cloud & Third-Party Gateways "]
        Razorpay["💳 Razorpay / Stripe<br/><i>Subscriptions & Recurring Billing</i>"]
        GMaps["🗺️ Google Maps Platform<br/><i>Route Directions & Geo-Sequencing</i>"]
        FCM["🔔 Firebase FCM & SMS<br/><i>OTP Dispatch & Push Alerts</i>"]
        AWS["☁️ AWS S3 & CloudFront<br/><i>KYC Docs & Food Media CDN</i>"]
    end

    Mobile -->|HTTPS / REST API| API
    Admin -->|HTTPS / REST API| API
    API --- Shared
    Shared -.->|Types| Mobile
    Shared -.->|Types| Admin

    API --> SubModules
    AuthMod & SubMod & KitchenMod & DelivMod & ProfMod --> PG
    AuthMod & DelivMod --> Redis
    SubMod -->|Queue Daily Tickets| Queue
    Queue --> KitchenMod & DelivMod

    PayMod --> Razorpay
    NavMod & DelivMod --> GMaps
    AuthMod & DelivMod --> FCM
    API --> AWS
```

### Architectural Components Breakdown

| Layer | Package / Service | Tech Stack | Responsibility |
| :--- | :--- | :--- | :--- |
| **Mobile App** | [`apps/mobile`](apps/mobile) | React Native, Expo 51, TypeScript | Customer subscription ordering, meal preference customization, live delivery tracking, and rider OTP handover. |
| **Admin Web Portal** | [`apps/admin`](apps/admin) | React 18, Vite 5, Bootstrap, TypeScript | Mission control dashboard for admin registration, payment simulation, route mapping, fleet dispatch, and multi-role directory management. |
| **Backend API** | [`services/api`](services/api) | Node.js 20+, Express 4, Zod, Helmet | Central REST API handling authentication, payments, geo-routing, delivery lifecycle states, OTP generation, and daily ticket generation. |
| **Shared Contracts** | [`packages/shared`](packages/shared) | TypeScript (ES Modules) | Strict type definitions and interfaces for Profiles, Subscriptions, Meal Types, Roles, and Delivery Orders across all apps. |
| **Database & Cache** | [`services/api/src/infrastructure`](services/api/src/infrastructure) | PostgreSQL 16 + Redis 7 | Relational persistence for accounts, subscriptions, and delivery logs; Redis for low-latency session caching and GPS coordinates. |
| **Job Queue** | [`services/api/src/jobs`](services/api/src/jobs) | BullMQ / AWS SQS | Automated batch processing for generating morning and evening kitchen dispatch manifests. |

---

## 👥 Multi-Role Enterprise Ecosystem

UrbanThali Foods utilizes a unified, role-based architecture supporting four distinct enterprise personas. Each persona has custom permissions, profiles, and operational views.

### Role Domain Model

```mermaid
classDiagram
    direction TB
    class BaseProfile {
        +string id
        +string name
        +string email
        +string phone
        +ProfileRole role
        +ProfileStatus status
        +string createdAtIso
        +string updatedAtIso
    }

    class CustomerProfile {
        +Address[] addresses
        +CustomerPreferences preferences
        +number loyaltyPoints
        +string activeSubscriptionId
    }

    class RiderProfile {
        +string vehicleType
        +string vehicleNumber
        +string drivingLicense
        +number rating
        +number totalDeliveries
        +string activeHub
        +number currentLat
        +number currentLng
    }

    class KitchenProfile {
        +string kitchenName
        +string fssaiLicense
        +string address
        +string city
        +number dailyCapacity
        +MealType[] specialties
        +string operatingHours
        +number currentOrdersLoad
    }

    class AdminProfile {
        +string department
        +string[] permissions
        +string lastLoginIso
    }

    BaseProfile <|-- CustomerProfile : role = "customer"
    BaseProfile <|-- RiderProfile : role = "rider"
    BaseProfile <|-- KitchenProfile : role = "kitchen"
    BaseProfile <|-- AdminProfile : role = "admin"
```

### Stakeholder Responsibilities Matrix

| Enterprise Persona | Primary Surface | Permissions & Key Responsibilities | Key Data Attributes |
| :--- | :--- | :--- | :--- |
| **👤 Customer** | Mobile App | Choose subscription plan (Weekly/Monthly), set meal dietary preferences (Veg, Non-Veg, Jain, Keto), select delivery slots (Lunch/Dinner), pause/resume meal deliveries, track live order arrival, verify delivery with OTP. | Dietary restrictions, spice tolerance, delivery addresses, loyalty points balance. |
| **🍳 Kitchen Partner** | Admin Web / Kitchen View | Access automated batch prep manifests, monitor capacity loads, manage menu items, print packaging checklists, mark food batches as "Packed & Ready". | FSSAI License, daily capacity limits, specialties, operational hours, kitchen address. |
| **🛵 Delivery Rider** | Mobile App / Rider View | View assigned delivery routes, navigate via Google Maps waypoints, update order lifecycle states (Picked Up -> In Transit), collect OTP proof of delivery. | Vehicle type (EV/Bike/Scooter), registration number, driving license, assigned hub, live GPS coordinates. |
| **🛡️ Operations Admin** | Admin Web Portal | Global platform oversight: onboard kitchen partners and riders, monitor system KPIs, simulate payments, trigger route optimization, resolve customer tickets, audit admin logs. | Department (Logistics, Kitchen, Finance, SuperAdmin), granular permission scopes, audit history. |

---

## 🔄 End-to-End Operational Workflows

### Daily Lifecycle: From Subscription to Doorstep

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer
    participant Mobile as 📱 Customer Mobile App
    participant API as 🚀 Central Express API
    participant Batch as ⏰ BullMQ Scheduler
    participant Kitchen as 🍳 Cloud Kitchen Hub
    participant Rider as 🛵 Fleet Delivery Rider
    actor Admin as 💻 Admin Ops Center

    Customer->>Mobile: Subscribes to 30-Day Lunch Plan (Jain / Medium Spice)
    Mobile->>API: POST /payments/create-intent & /confirm
    API-->>Customer: Subscription Confirmed (Plan ID: SUB-9021)

    Note over Batch,API: 06:00 AM — Automated Batch Generation
    Batch->>API: Trigger generateDailyDeliveryTickets()
    API->>Kitchen: Daily Prep Manifest (Veg: 120, Non-Veg: 85, Jain: 40, Keto: 15)
    Kitchen->>Kitchen: Cook, inspect hygiene, seal in tamper-evident thali boxes
    Kitchen->>API: Mark batch as "Packed & Staged at Hub"

    Note over API,Admin: 11:15 AM — Dynamic Route Dispatch
    Admin->>API: POST /navigation/route (Compute optimal route & ETA)
    API->>API: POST /deliveries (Assign delivery to Rider with waypoints)
    API->>Rider: Notification: 12 orders assigned for Baner-Hinjawadi route
    
    Rider->>API: PATCH /deliveries/:id/status ("picked_up")
    Rider->>API: PATCH /deliveries/:id/status ("in_transit")

    Note over Customer,Mobile: Real-Time GPS Tracking
    Customer->>Mobile: View live delivery map
    Mobile->>API: GET /deliveries/:id/tracking
    API-->>Mobile: Coordinates, status: "in_transit", ETA: 12 mins
    
    Note over Rider,Customer: Secure Handover Verification
    Rider->>Customer: Arrives at customer doorstep
    API->>Customer: POST /notifications/send-otp (Sends 4-digit code)
    Customer->>Rider: Confirms code verbally
    Rider->>API: POST /notifications/verify-otp + status: "delivered"
    API-->>Admin: Real-time dashboard KPI updated: 99.4% On-Time Delivery
```

### Delivery State Machine

Every delivery follows a finite state machine ensuring auditability and traceability:

```mermaid
stateDiagram-v2
    [*] --> assigned : Order Generated from Active Subscription
    assigned --> picked_up : Rider collects sealed thali from Kitchen Hub
    picked_up --> in_transit : Rider departs on navigation route
    in_transit --> delivered : Customer verifies delivery via OTP / Handover
    in_transit --> failed : Customer unreachable / address incorrect
    assigned --> failed : Hub stockout or rider unavailable
    delivered --> [*] : Order completed & delivery ledger updated
    failed --> [*] : Support ticket auto-created & meal credited back
```

---

## 📂 Monorepo Structure

```text
UrbanThali-Foods/
├── 📁 apps/
│   ├── 📱 mobile/                     # Cross-platform Expo customer & rider mobile app
│   │   ├── App.tsx                    # Multi-screen navigation (Home, Subscriptions, Live Tracking, Profile)
│   │   ├── app.json                   # Expo configuration & deep linking
│   │   └── package.json               # Mobile dependencies (React Native 0.74, Expo 51)
│   └── 💻 admin/                      # Operations, kitchen & fleet control center web app
│       ├── src/
│       │   ├── App.tsx                # Enterprise dashboard, kitchen prep, fleet dispatch, RBAC profiles
│       │   ├── main.tsx               # React 18 DOM bootstrap
│       │   ├── styles.css             # Operational theme & responsive styling
│       │   └── assets/                # Operations telemetry illustrations & maps
│       ├── vite.config.ts             # Vite 5 build configuration
│       └── package.json               # Web dependencies (React 18, Vite, Bootstrap)
├── 📁 services/
│   └── 🚀 api/                        # Central backend API and domain microservices
│       ├── src/
│       │   ├── index.ts               # Express server bootstrap, middleware, router orchestration
│       │   ├── config/                # Environment variable parsing & Zod schema validation
│       │   ├── infrastructure/        # Cloud, Postgres, Redis, and BullMQ/SQS adapters
│       │   │   ├── cloud.ts           # AWS S3 & CloudFront configuration
│       │   │   ├── postgres.ts        # PostgreSQL connection pool mapping
│       │   │   ├── queues.ts          # Queue provider mapping (BullMQ / AWS SQS)
│       │   │   └── redis.ts           # Redis caching & pub/sub client mapping
│       │   ├── jobs/                  # Background worker routines (daily ticket generation)
│       │   ├── modules/               # Domain-driven feature modules
│       │   │   ├── auth/              # Admin registration, JWT login, credential verification
│       │   │   ├── deliveries/        # Delivery lifecycle, status transitions, GPS tracking
│       │   │   ├── navigation/        # Route calculations, waypoint sequencing, ETA generator
│       │   │   ├── notifications/     # OTP generation, verification, and Firebase alerts
│       │   │   ├── payments/          # Payment intent creation and confirmation (Razorpay/Stripe)
│       │   │   ├── profiles/          # Multi-role profile CRUD, stats, and role filtering
│       │   │   └── subscriptions/     # Subscription plans, active plan catalog
│       │   └── routes/                # System health, readiness, and liveness endpoints
│       └── package.json               # Backend dependencies (Express, Zod, Helmet, tsx)
├── 📁 packages/
│   └── 📦 shared/                     # Shared domain contracts, models, and TypeScript types
│       ├── src/
│       │   ├── index.ts               # Barrel export for shared types
│       │   └── types.ts               # Domain interfaces (UserProfile, Subscription, MealType, Address)
│       └── package.json               # Shared package configuration
├── 📁 docs/                           # Architectural and operational documentation
│   ├── assets/                        # SVG graphical banners and architectural diagrams
│   ├── architecture.md                # System design & security baseline
│   ├── roadmap.md                     # Engineering delivery milestones
│   └── stack-coverage.md              # Technical requirements verification matrix
├── .env.example                       # Reference environment variables
├── package.json                       # Monorepo root workspaces script runner
└── README.md                          # Primary enterprise documentation
```

### Workspaces Topology

```mermaid
graph LR
    Shared["📦 packages/shared<br/><i>Single Source of Truth</i>"]
    API["🚀 services/api<br/><i>Backend REST Engine</i>"]
    Admin["💻 apps/admin<br/><i>Web Operations</i>"]
    Mobile["📱 apps/mobile<br/><i>Mobile Surface</i>"]

    Shared ==>|Type Contracts| API
    Shared ==>|Type Contracts| Admin
    Shared ==>|Type Contracts| Mobile

    API -->|REST Endpoints| Admin
    API -->|REST Endpoints| Mobile
```

---

## 🚀 Quick Start Guide (< 5 Minutes)

### 1. Prerequisites
Ensure your local machine has the following installed:
* **Node.js**: `v20.0.0` or higher ([Download Node.js](https://nodejs.org/))
* **npm**: `v10.0.0` or higher
* **Git**: Installed and configured

### 2. Clone & Install Dependencies
Run the workspace install from the root directory:
```bash
# Clone the repository
git clone https://github.com/Gaurav-Khaladkar/UrbanThali-Foods.git

# Enter project directory
cd UrbanThali-Foods

# Install all workspace dependencies across apps, services, and packages
npm install
```

### 3. Configure Environment Variables
Copy the template `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```

| Environment Variable | Description | Default / Local Development Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `API_PORT` | Port for the Express backend REST API | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/urbanthali` |
| `REDIS_URL` | Redis cache and queue connection string | `redis://localhost:6379` |
| `QUEUE_PROVIDER` | Background job queue provider (`bullmq` or `sqs`) | `bullmq` |
| `BULLMQ_QUEUE_NAME` | BullMQ queue name for daily ticket processing | `daily-manifest-jobs` |
| `AWS_REGION` | AWS infrastructure deployment region | `ap-south-1` |
| `AWS_S3_BUCKET` | S3 bucket for meal photos and KYC documents | `urbanthali-assets` |
| `AWS_CLOUDFRONT_DOMAIN`| CDN domain for fast asset delivery | `cdn.urbanthali.local` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID for subscription billing | `your_key_id` *(mock sandbox active)* |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | `your_key_secret` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key for route & ETA calculation | `your_maps_key` *(fallback engine active)* |

### 4. Launch Workspaces
You can run individual services or start all services simultaneously in separate terminal windows:

| Service | Workspace Command | Default URL | Description |
| :--- | :--- | :--- | :--- |
| **🚀 Central API** | `npm run dev:api` | [http://localhost:4000](http://localhost:4000) | Express REST API server with hot-reloading via `tsx watch` |
| **💻 Admin Portal** | `npm run dev:admin` | [http://localhost:5173](http://localhost:5173) | Vite + React operations and kitchen web dashboard |
| **📱 Mobile App** | `npm run dev:mobile` | [http://localhost:8081](http://localhost:8081) | Expo Metro bundler for iOS, Android, and Web preview |

> [!TIP]
> **One-Command Build & Verification:**
> Before submitting code, run the workspace-wide verification scripts:
> ```bash
> # Typecheck all packages
> npm run typecheck
> 
> # Build all workspaces for production
> npm run build
> ```

### 5. Verify System Health
Confirm the backend API is operating smoothly:
```bash
curl http://localhost:4000/health/liveness
```
**Expected Response:**
```json
{
  "status": "ok",
  "uptimeSeconds": 14.28,
  "timestamp": "2026-10-15T17:10:00.000Z"
}
```

---

## 📡 Complete REST API Reference

The UrbanThali API is structured around domain-driven REST principles with full JSON payloads and predictive HTTP status codes.

### API Service Endpoints Summary

```text
BASE URL: http://localhost:4000
├── /health             # System health, readiness, and liveness checks
├── /auth               # Admin registration and staff login
├── /subscriptions      # Subscription plans catalog
├── /profiles           # Multi-role profile CRUD and role metrics
├── /deliveries         # Order dispatch, status changes, and live tracking
├── /navigation         # Route generation, waypoint sequencing, and ETAs
├── /payments           # Payment intent creation and confirmation
└── /notifications      # OTP dispatch and verification
```

---

### 1. Authentication Module (`/auth`)

#### Register Admin Account
* **Method & Route:** `POST /auth/admin/register`
* **Description:** Onboards a new administrative user into the system.
* **Request Payload:**
```json
{
  "name": "Operations Lead",
  "email": "ops@urbanthali.com",
  "password": "SecurePassword123"
}
```
* **Success Response (`201 Created`):**
```json
{
  "message": "Admin registered successfully",
  "user": {
    "id": "c1f76d91-3252-44df-90a6-c0a72ff1ef5e",
    "name": "Operations Lead",
    "email": "ops@urbanthali.com",
    "role": "admin"
  }
}
```

#### Staff / Admin Login
* **Method & Route:** `POST /auth/login`
* **Description:** Authenticates an administrative user and issues a bearer access token.
* **Request Payload:**
```json
{
  "email": "admin@proapp.local",
  "password": "Admin@123"
}
```
* **Success Response (`200 OK`):**
```json
{
  "message": "Login successful",
  "token": "admin-mock-token-1760548200000",
  "user": {
    "id": "1",
    "name": "Platform Admin",
    "email": "admin@proapp.local",
    "role": "admin"
  }
}
```

---

### 2. Subscriptions Module (`/subscriptions`)

#### List Available Subscription Plans
* **Method & Route:** `GET /subscriptions`
* **Description:** Retrieves available recurring meal plans with pricing and duration cycles.
* **Success Response (`200 OK`):**
```json
[
  {
    "id": "plan-weekly-classic",
    "name": "Weekly Classic Thali",
    "cycleDays": 7,
    "priceInPaise": 149900
  },
  {
    "id": "plan-monthly-pro",
    "name": "Monthly Executive Thali",
    "cycleDays": 30,
    "priceInPaise": 549900
  }
]
```

---

### 3. Multi-Role Profiles Module (`/profiles`)

#### List Profiles with Role & Keyword Filters
* **Method & Route:** `GET /profiles?role=kitchen&search=Pune`
* **Query Parameters:**
  * `role`: Optional filter by role (`customer`, `rider`, `kitchen`, `admin`)
  * `search`: Case-insensitive text filter matching names, emails, phones, or hubs
* **Success Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "prof-kitch-1",
      "name": "Chef Sunita Rao",
      "email": "sunita@urbanthali.com",
      "phone": "+91 98230 11223",
      "role": "kitchen",
      "status": "active",
      "kitchenName": "UrbanThali Central Kitchen - Baner",
      "fssaiLicense": "11521034000123",
      "dailyCapacity": 500,
      "specialties": ["veg", "jain"],
      "operatingHours": "06:00 - 22:00",
      "currentOrdersLoad": 312
    }
  ],
  "count": 1
}
```

#### Get Platform Profile Aggregate Metrics
* **Method & Route:** `GET /profiles/stats`
* **Description:** Returns live counts of all ecosystem participants for admin KPIs.
* **Success Response (`200 OK`):**
```json
{
  "data": {
    "total": 8,
    "customers": 2,
    "riders": 2,
    "kitchens": 2,
    "admins": 2,
    "activeCount": 7
  }
}
```

#### Create New Profile
* **Method & Route:** `POST /profiles`
* **Description:** Creates an enterprise profile with role-specific schema validation.
* **Example Payload (Delivery Rider):**
```json
{
  "role": "rider",
  "name": "Amit Shinde",
  "email": "amit.rider@urbanthali.com",
  "phone": "+91 98900 12345",
  "vehicleType": "ev",
  "vehicleNumber": "MH 12 UT 9090",
  "drivingLicense": "MH12-2022-998877",
  "activeHub": "Baner Central Hub"
}
```

---

### 4. Deliveries & Fleet Dispatch (`/deliveries`)

#### Create & Dispatch Delivery Order
* **Method & Route:** `POST /deliveries`
* **Request Payload:**
```json
{
  "customerName": "Rohan Deshmukh",
  "customerPhone": "9822001122",
  "address": "Tower 4, Blue Ridge, Hinjawadi Phase 1, Pune",
  "riderName": "Amit Shinde",
  "start": { "lat": 18.559, "lng": 73.7797 },
  "end": { "lat": 18.5913, "lng": 73.7389 }
}
```
* **Success Response (`201 Created`):**
```json
{
  "id": "d7e9b048-28ff-4530-b328-9121a97c413b",
  "customerName": "Rohan Deshmukh",
  "customerPhone": "9822001122",
  "address": "Tower 4, Blue Ridge, Hinjawadi Phase 1, Pune",
  "status": "assigned",
  "riderName": "Amit Shinde",
  "etaMinutes": 20,
  "route": [
    { "lat": 18.559, "lng": 73.7797 },
    { "lat": 18.56707, "lng": 73.7695 },
    { "lat": 18.57515, "lng": 73.7593 },
    { "lat": 18.58322, "lng": 73.7491 },
    { "lat": 18.5913, "lng": 73.7389 }
  ],
  "createdAtIso": "2026-10-15T17:15:00.000Z"
}
```

#### Update Order Delivery Lifecycle Status
* **Method & Route:** `PATCH /deliveries/:deliveryId/status`
* **Request Payload:**
```json
{
  "status": "in_transit"
}
```
* **Valid Status Values:** `assigned` | `picked_up` | `in_transit` | `delivered` | `failed`

#### Real-Time Delivery Tracking & Telemetry
* **Method & Route:** `GET /deliveries/:deliveryId/tracking`
* **Description:** Consumed by the mobile map to render the rider's simulated GPS position along the delivery corridor.
* **Success Response (`200 OK`):**
```json
{
  "deliveryId": "d7e9b048-28ff-4530-b328-9121a97c413b",
  "status": "in_transit",
  "etaMinutes": 10,
  "currentPosition": {
    "lat": 18.57515,
    "lng": 73.7593
  },
  "route": [
    { "lat": 18.559, "lng": 73.7797 },
    { "lat": 18.56707, "lng": 73.7695 },
    { "lat": 18.57515, "lng": 73.7593 },
    { "lat": 18.58322, "lng": 73.7491 },
    { "lat": 18.5913, "lng": 73.7389 }
  ]
}
```

---

### 5. Navigation & Routing (`/navigation`)

#### Generate Waypoints and Route Distance
* **Method & Route:** `POST /navigation/route`
* **Request Payload:**
```json
{
  "start": { "lat": 18.5204, "lng": 73.8567 },
  "end": { "lat": 18.559, "lng": 73.7797 }
}
```
* **Success Response (`200 OK`):**
```json
{
  "etaMinutes": 20,
  "distanceKm": 11.2,
  "points": [
    { "lat": 18.5204, "lng": 73.8567 },
    { "lat": 18.53005, "lng": 73.83745 },
    { "lat": 18.5397, "lng": 73.8182 },
    { "lat": 18.54935, "lng": 73.79895 },
    { "lat": 18.559, "lng": 73.7797 }
  ]
}
```

---

### 6. Payments Module (`/payments`)

#### Create Subscription Payment Intent
* **Method & Route:** `POST /payments/create-intent`
* **Request Payload:**
```json
{
  "amount": 19900,
  "currency": "INR"
}
```
* **Success Response (`200 OK`):**
```json
{
  "paymentIntentId": "pi_mock_1760548500000",
  "amount": 19900,
  "currency": "INR",
  "status": "requires_payment_method"
}
```

#### Confirm Payment & Trigger Subscription Activation
* **Method & Route:** `POST /payments/confirm`
* **Request Payload:**
```json
{
  "paymentIntentId": "pi_mock_1760548500000"
}
```
* **Success Response (`200 OK`):**
```json
{
  "paymentIntentId": "pi_mock_1760548500000",
  "status": "succeeded",
  "message": "Payment confirmed in sandbox mode"
}
```

---

### 7. OTP Notifications Module (`/notifications`)

#### Request One-Time Password (OTP)
* **Method & Route:** `POST /notifications/send-otp`
* **Request Payload:**
```json
{
  "phone": "+919822001122"
}
```
* **Success Response (`200 OK`):**
```json
{
  "message": "OTP sent successfully",
  "otp": "1234"
}
```

#### Verify OTP for Delivery Handover
* **Method & Route:** `POST /notifications/verify-otp`
* **Request Payload:**
```json
{
  "phone": "+919822001122",
  "otp": "1234"
}
```
* **Success Response (`200 OK`):**
```json
{
  "verified": true,
  "message": "OTP verified successfully"
}
```

---

### 8. System Health Probes (`/health`)

| Route | Method | Purpose | Typical Response |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | General system heartbeat | `{"status":"ok","timestamp":"2026-10-15T..."}` |
| `/health/liveness` | `GET` | Kubernetes / Docker liveness probe | `{"status":"ok","uptimeSeconds":14.28}` |
| `/health/readiness`| `GET` | Confirms database, cache, and queue readiness | `{"status":"ready","database":"connected","redis":"connected"}` |

---

## 🎛️ Operations & Admin Runbook

### Cloud Kitchen Prep Runbook
1. **06:00 AM Manifest Cutoff:** The daily ticket generator calculates total meals per category:
   - **Veg Thali:** Paneer makhani, dal tadka, 3 phulkas, jeera rice, seasonal subji.
   - **Non-Veg Thali:** Murgh kolhapuri / egg curry, dal, phulkas, steamed rice.
   - **Jain Thali:** No onion, no garlic, strict root-vegetable exclusions.
   - **Keto / Low-Carb:** Cauliflower rice, grilled paneer/chicken, sautéed vegetables.
2. **Quality & Packaging Checklist:** Seal boxes with color-coded bands (Green = Veg, Red = Non-Veg, Yellow = Jain, Blue = Keto). Attach customer QR / ID ticket.
3. **Dispatch Staging:** Group orders by delivery cluster zones (e.g., *Cluster A - Hinjawadi Tech Park*, *Cluster B - Aundh-Baner*).

### Rider Dispatch & Fleet Tracking Runbook
1. **Rider Arrival:** Rider checks in at the designated hub via mobile app.
2. **Cluster Acceptance:** Rider scans batch tickets and accepts the optimized route corridor.
3. **Transit Telemetry:** Once marked `in_transit`, real-time waypoints guide the rider and update the customer's mobile map.
4. **OTP Handover:** The rider enters the 4-digit code provided by the customer. Orders cannot be marked `delivered` without code verification.

### Customer Subscription Management Runbook
* **Pause / Skip Meal:** Customers can pause delivery for up to 14 days directly in the mobile app before 09:00 PM for the next day's lunch.
* **Address Switching:** Allows office delivery for lunch and home delivery for dinner.

### Default Sandbox Test Credentials

```text
Admin Portal Login:
- Email:    admin@proapp.local
- Password: Admin@123

Sandbox Notification OTP:
- Fixed Code: 1234

Mock Payment Intent:
- Gateway:   Sandbox Simulator
- Currency:  INR (Paise unit calculation)
```

---

## ☁️ Cloud & Production Deployment

### Production AWS Architecture

```mermaid
flowchart TD
    subgraph Users[" 🌍 Client Traffic "]
        WebUsers["💻 Desktop / Admin Users"]
        AppUsers["📱 iOS / Android Mobile App"]
    end

    subgraph AWSCloud[" ☁️ Amazon Web Services (AWS ap-south-1) "]
        Route53["🌐 AWS Route 53<br/><i>DNS & Latency Routing</i>"]
        CF["⚡ AWS CloudFront CDN<br/><i>Static Assets & Meal Photos</i>"]
        ALB["⚖️ Application Load Balancer<br/><i>SSL Termination & Health Checks</i>"]
        
        subgraph ComputeCluster[" 🐳 Amazon ECS / EKS (Fargate) "]
            APIContainer1["🚀 API Container 1"]
            APIContainer2["🚀 API Container 2"]
            WorkerContainer["⚙️ Async BullMQ Worker"]
        end

        subgraph StorageLayer[" 💾 Managed Data Services "]
            RDS[("🐘 Amazon RDS PostgreSQL<br/><i>Multi-AZ Primary & Standby</i>")]
            ElastiCache[("⚡ Amazon ElastiCache Redis<br/><i>Session State & Route Cache</i>")]
            S3["🪣 Amazon S3 Bucket<br/><i>Receipts, KYC & Media</i>"]
            SQS["📬 Amazon SQS<br/><i>High-Throughput Task Queues</i>"]
        end
    end

    WebUsers & AppUsers --> Route53
    Route53 --> CF
    Route53 --> ALB
    CF --> S3
    ALB --> APIContainer1 & APIContainer2
    APIContainer1 & APIContainer2 --> RDS
    APIContainer1 & APIContainer2 --> ElastiCache
    APIContainer1 & APIContainer2 --> SQS
    SQS --> WorkerContainer
    WorkerContainer --> RDS
```

### Environment Readiness Summary

| Infrastructure Piece | Development Status | File Reference | Production Alternative |
| :--- | :--- | :--- | :--- |
| **Relational Database** | PostgreSQL Configuration Ready | [`postgres.ts`](services/api/src/infrastructure/postgres.ts) | Amazon RDS PostgreSQL (db.t4g.medium Multi-AZ) |
| **Caching Layer** | Redis Client Configuration Ready | [`redis.ts`](services/api/src/infrastructure/redis.ts) | Amazon ElastiCache Redis Cluster |
| **Job Queue** | BullMQ & SQS Dual-Driver Adapter | [`queues.ts`](services/api/src/infrastructure/queues.ts) | Amazon SQS with Dead Letter Queue (DLQ) |
| **Cloud Storage & CDN** | AWS S3 + CloudFront Environment Mapping | [`cloud.ts`](services/api/src/infrastructure/cloud.ts) | AWS S3 Bucket with IAM least privilege role |
| **Payment Gateways** | Sandbox Flow with Razorpay/Stripe hooks | [`payment.service.ts`](services/api/src/modules/payments/payment.service.ts) | Razorpay Webhooks + Stripe Production API Keys |
| **Route Generation** | Interpolated GPS Engine with Google Maps hooks | [`navigation.service.ts`](services/api/src/modules/navigation/navigation.service.ts) | Google Maps Directions API & Roads API |

---

## 🔒 Security, Data Governance & Compliance

* **Role-Based Access Control (RBAC):** Principle of least privilege enforced across API controllers. Admin operations are logged for security auditing.
* **FSSAI Compliance Verification:** Every kitchen partner must submit a valid 14-digit FSSAI license number before onboarding.
* **PII Data Protection:** Customer phone numbers and precise street addresses are tokenized and only exposed to riders during active transit.
* **Zero Plaintext Credentials:** Secrets and gateway API keys are read strictly from sanitized environment variables via Zod schemas.
* **API Shielding:** HTTP headers hardened via `helmet` and Cross-Origin Resource Sharing locked down via `cors`.

---

## 🗺️ Product Development Roadmap

```mermaid
gantt
    title UrbanThali Foods Engineering Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Foundation
    Monorepo bootstrap & Shared types     :done, 2026-09-01, 2026-09-15
    Express API, Health & Auth endpoints   :done, 2026-09-15, 2026-09-30
    section Phase 2: Subscriptions & Admin
    Multi-role profiles (Customer, Rider, Kitchen, Admin) :done, 2026-10-01, 2026-10-15
    Admin control portal & Payment sandbox :done, 2026-10-01, 2026-10-15
    section Phase 3: Kitchen & Dispatch
    Automated daily kitchen batch manifests :active, 2026-10-16, 2026-11-05
    Real-time GPS routing & rider clustering:active, 2026-10-20, 2026-11-15
    section Phase 4: Business Controls
    Finance ledger, tax reconciliation & promo codes : 2026-11-16, 2026-12-10
    Operational KPI alerts & analytics dashboard    : 2026-12-01, 2026-12-25
    section Phase 5: Production Hardening
    AWS ECS Fargate deployment & load testing       : 2026-12-26, 2027-01-15
    App Store & Google Play production releases      : 2027-01-16, 2027-02-01
```

---

## 📜 License & Enterprise Support

* **License:** Proprietary. Copyright © 2026 UrbanThali Foods. All rights reserved.
* **Enterprise Operations Support:** `operations@urbanthali.local`
* **Engineering & Architecture:** `engineering@urbanthali.local`
* **Security & Vulnerability Disclosures:** `security@urbanthali.local`

---

<p align="center">
  <strong>UrbanThali Foods</strong> • Engineering Scalable Urban Nutrition
</p>
