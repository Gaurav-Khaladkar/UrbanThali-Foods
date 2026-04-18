import { randomUUID } from "node:crypto";
import type { CreateSubscriptionInput, Subscription } from "./subscription.model.js";

const subscriptions: Subscription[] = [];

export function createSubscription(input: CreateSubscriptionInput): Subscription {
  const subscription: Subscription = {
    id: randomUUID(),
    customerId: input.customerId,
    planCode: input.planCode,
    mealPreference: input.mealPreference,
    startDateIso: input.startDateIso,
    nextBillingDateIso: input.startDateIso,
    status: "active"
  };

  subscriptions.push(subscription);
  return subscription;
}

export function listSubscriptions(): Subscription[] {
  return subscriptions;
}
