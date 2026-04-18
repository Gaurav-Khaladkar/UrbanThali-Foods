import type { LatLng } from "../navigation/navigation.service.js";

export type DeliveryStatus = "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";

export interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: DeliveryStatus;
  riderName: string;
  start: LatLng;
  end: LatLng;
  route: LatLng[];
  etaMinutes: number;
  createdAtIso: string;
}

export const deliveries: DeliveryOrder[] = [];
