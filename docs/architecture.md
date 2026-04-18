# Architecture Overview

## High-Level Design

UrbanThali Foods uses a modular architecture with independently deployable surfaces:

- `apps/mobile`: customer-facing app for subscriptions and delivery tracking
- `apps/admin`: internal control center for menu, kitchen, delivery, and finance
- `services/api`: central API and business workflows
- `packages/shared`: shared contracts for domain consistency

## Core Domain Modules

1. Identity and Access
   - OTP login
   - JWT access and refresh flow
   - Role-based access (admin, kitchen, rider, customer)

2. Subscription Engine
   - Weekly/monthly plans
   - Pause/skip windows
   - Renewal management

3. Menu and Kitchen
   - Slot-based menus (lunch/dinner)
   - Prep list generation
   - Packing checklist

4. Dispatch and Delivery
   - Zone assignment
   - Route sequencing
   - OTP/QR proof of delivery

5. Billing and Ledger
   - Razorpay recurring payments
   - Invoice and tax metadata
   - Refund and wallet adjustments

## Request Flow

1. Customer updates subscription plan in mobile app.
2. Mobile sends authenticated request to API.
3. API validates and persists state in PostgreSQL.
4. Background jobs generate daily delivery tickets.
5. Admin and rider surfaces fetch filtered data from API.

## Security Baseline

- HTTPS only traffic
- Encrypted secrets management
- PII encryption strategy for sensitive records
- Principle of least privilege for internal roles
- Audit logs for critical admin actions
