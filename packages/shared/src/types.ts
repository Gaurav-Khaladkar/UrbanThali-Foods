export type MealType = "veg" | "non_veg" | "jain" | "keto";

export type SubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

export interface SubscriptionPlan {
  id: string;
  name: string;
  cycleDays: number;
  priceInPaise: number;
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  preferredMealType: MealType;
  startDateIso: string;
  endDateIso: string;
}
