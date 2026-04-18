import { listSubscriptions } from "../modules/subscriptions/subscription.service.js";

export function generateDailyDeliveryTickets(): { count: number; generatedAtIso: string } {
  const activeSubscriptions = listSubscriptions().filter(
    (subscription) => subscription.status === "active"
  );

  return {
    count: activeSubscriptions.length,
    generatedAtIso: new Date().toISOString()
  };
}
