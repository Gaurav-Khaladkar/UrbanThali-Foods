# Stack Coverage Against Requested Professional Points

## Included in Code

1. Mobile app (cross-platform, one codebase)
   - Implemented with React Native (Expo) in `apps/mobile`.
   - Equivalent cross-platform architecture for Android and iOS.

2. Admin and kitchen web app
   - Implemented with React + TypeScript in `apps/admin`.
   - Multi-page operations flow with admin registration, login, payments, mapping, and delivery controls.

3. Backend APIs
   - Implemented with Node.js + Express + TypeScript in `services/api`.
   - Endpoints:
     - `/auth/admin/register`, `/auth/login`
     - `/payments/create-intent`, `/payments/confirm`
     - `/navigation/route`
     - `/deliveries`, `/deliveries/:deliveryId/status`, `/deliveries/:deliveryId/tracking`
     - `/notifications/send-otp`, `/notifications/verify-otp`

4. PostgreSQL + Redis readiness
   - Environment and infrastructure config included:
     - `services/api/src/infrastructure/postgres.ts`
     - `services/api/src/infrastructure/redis.ts`
   - `DATABASE_URL` and `REDIS_URL` are wired in config.

5. Async job provider readiness (BullMQ/SQS)
   - Queue provider configuration included:
     - `services/api/src/infrastructure/queues.ts`
   - Supports selecting `bullmq` or `sqs` using env values.

6. AWS readiness
   - Cloud config mapping included:
     - `services/api/src/infrastructure/cloud.ts`
   - Includes region, S3, and CloudFront values from env.

7. Maps and route tracking
   - Navigation route generation and ETA in:
     - `services/api/src/modules/navigation/*`
   - Delivery tracking uses route points for current position simulation.

8. Payments (Razorpay primary, Stripe optional)
   - Payment APIs and gateway abstraction style in:
     - `services/api/src/modules/payments/*`
   - Env keys included for Razorpay and Stripe.

9. Notifications and auth (Firebase-style OTP flow)
   - OTP issue and verify APIs in:
     - `services/api/src/modules/notifications/*`
   - Env fields for Firebase project and FCM key included.

## Notes

- Current payment and OTP implementations are sandbox mocks for development speed.
- To switch to live production providers, replace module internals while preserving API contracts.
