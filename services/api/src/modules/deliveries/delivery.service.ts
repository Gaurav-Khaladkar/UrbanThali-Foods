import { randomUUID } from "node:crypto";
import { buildNavigationRoute, type LatLng } from "../navigation/navigation.service.js";
import { type DeliveryOrder, deliveries, type DeliveryStatus } from "./delivery.store.js";

export interface CreateDeliveryInput {
  customerName: string;
  customerPhone: string;
  address: string;
  riderName: string;
  start: LatLng;
  end: LatLng;
}

export function createDelivery(input: CreateDeliveryInput): DeliveryOrder {
  const route = buildNavigationRoute(input.start, input.end);
  const order: DeliveryOrder = {
    id: randomUUID(),
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    address: input.address,
    status: "assigned",
    riderName: input.riderName,
    start: input.start,
    end: input.end,
    route: route.points,
    etaMinutes: route.etaMinutes,
    createdAtIso: new Date().toISOString()
  };
  deliveries.push(order);
  return order;
}

export function listDeliveries(): DeliveryOrder[] {
  return deliveries;
}

export function updateDeliveryStatus(deliveryId: string, status: DeliveryStatus): DeliveryOrder {
  const delivery = deliveries.find((item) => item.id === deliveryId);
  if (!delivery) {
    throw new Error("Delivery not found");
  }
  delivery.status = status;
  return delivery;
}

export function getDeliveryTracking(deliveryId: string): {
  deliveryId: string;
  status: DeliveryStatus;
  etaMinutes: number;
  currentPosition: LatLng;
  route: LatLng[];
} {
  const delivery = deliveries.find((item) => item.id === deliveryId);
  if (!delivery) {
    throw new Error("Delivery not found");
  }

  const statusIndex: Record<DeliveryStatus, number> = {
    assigned: 0,
    picked_up: 2,
    in_transit: 5,
    delivered: delivery.route.length - 1,
    failed: 2
  };

  const currentPointIndex = Math.min(statusIndex[delivery.status], delivery.route.length - 1);
  return {
    deliveryId: delivery.id,
    status: delivery.status,
    etaMinutes: delivery.etaMinutes,
    currentPosition: delivery.route[currentPointIndex],
    route: delivery.route
  };
}
