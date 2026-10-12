import { EventEmitter } from "events";

export type PaidOrderEvent = {
  orderId: string;
  orderNumber: string;
  total: number;
  customerName: string;
};

const globalForEvents = globalThis as unknown as {
  orderEventBus?: EventEmitter;
};

export const orderEventBus =
  globalForEvents.orderEventBus ?? new EventEmitter();

if (!globalForEvents.orderEventBus) {
  globalForEvents.orderEventBus = orderEventBus;
  orderEventBus.setMaxListeners(50);
}

export const PAID_ORDER_EVENT = "order:paid";
