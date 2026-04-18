# UrbanThali Foods

Subscription-first tiffin platform for Android, iOS, Admin, Kitchen, and Delivery operations.

## Product Vision

UrbanThali Foods includes a professional service-operations foundation with working login/admin registration, payment, mapping/navigation, delivery workflow, and API-first integration.

## Monorepo Structure

```text
apps/
  mobile/      # React Native (Expo) customer app
  admin/       # React web app for admin and kitchen operations
services/
  api/         # Node.js + TypeScript backend API
packages/
  shared/      # Shared domain types and constants
docs/
  architecture.md
  roadmap.md
  stack-coverage.md
```

## Tech Stack

- Mobile: React Native (Expo) + TypeScript
- Admin: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Data: PostgreSQL + Redis (configuration included)
- Payments: Razorpay (initial), Stripe (optional expansion)
- Maps and Tracking: Google Maps Platform

## Quick Start

1. Install Node.js 20+.
2. Copy `.env.example` values to a local `.env` file where needed.
3. Install workspace dependencies:
   - `npm install`
4. Run apps:
   - API: `npm run dev:api`
   - Admin: `npm run dev:admin`
   - Mobile: `npm run dev:mobile`

## Current Working Modules

- Admin registration and login APIs
- Payment intent and confirmation APIs (sandbox)
- Mapping route API with ETA and point generation
- Delivery creation, status updates, and tracking APIs
- OTP notification and verification APIs
- Professional admin web pages and mobile navigation screens

## Branching

- Mainline branch: `main`
- Feature branch pattern: `feature/<module-name>`
- Fix branch pattern: `fix/<module-name>`

## License

Proprietary. All rights reserved by UrbanThali Foods.
