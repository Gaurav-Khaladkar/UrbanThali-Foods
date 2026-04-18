export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";
export type MealPreference = "veg" | "non_veg" | "jain" | "keto";

export interface Subscription {
  id: string;
  customerId: string;
  planCode: string;
  status: SubscriptionStatus;
  mealPreference: MealPreference;
  startDateIso: string;
  nextBillingDateIso: string;
}

export interface CreateSubscriptionInput {
  customerId: string;
  planCode: string;
  mealPreference: MealPreference;
  startDateIso: string;
}
