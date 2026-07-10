import type { Order, OrderItem, Medicine, Prescription } from "@prisma/client";

/** Full order shape returned by OrderService.getUserOrders */
export type OrderWithItems = Order & {
  items: (OrderItem & { medicine: Medicine })[];
  prescription: Prescription | null;
};

/** Payload pushed over the SSE stream for a single status change */
export interface OrderStatusEvent {
  orderId: string;
  status: Order["status"];
}
