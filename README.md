# UrbanThali Foods

Subscription-first tiffin platform for Android, iOS, Admin, Kitchen, and Delivery operations.

## Product Vision

UrbanThali Foods helps customers subscribe to reliable daily meals while giving operations teams full control over planning, production, dispatch, and reconciliation.

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
```

## Tech Stack

- Mobile: React Native (Expo) + TypeScript
- Admin: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Data: PostgreSQL + Redis (planned integration)
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

## Initial Delivery Scope

- Subscription plans (5-day and 7-day weekly cycles)
- Pause/Skip calendar
- Meal preference profile (Veg, Jain, Keto, custom notes)
- Delivery ticket generation
- OTP/QR proof-of-delivery workflow
- Admin analytics baseline

## Branching

- Mainline branch: `main`
- Feature branch pattern: `feature/<module-name>`
- Fix branch pattern: `fix/<module-name>`

## License

Proprietary. All rights reserved by UrbanThali Foods.
