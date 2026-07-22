import type {
  CreateOrderFromCheckoutInput,
  Order,
  OrderActorContext,
  OrderStatus,
} from "./order-entities";
import { ORDER_STATUS_TRANSITIONS } from "./order-entities";

export function hasAtLeastOneItem(itemCount: number): boolean {
  return itemCount >= 1;
}

export function isNonNegativeMoney(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function isCurrencyConsistent(currency: string, expected = "IDR"): boolean {
  return currency === expected;
}

export function isGrandTotalConsistent(input: {
  itemsSubtotal: number;
  shippingFee: number;
  discountTotal: number;
  grandTotal: number;
}): boolean {
  const expected = input.itemsSubtotal + input.shippingFee - input.discountTotal;
  return input.grandTotal === expected;
}

export function areLineTotalsConsistent(
  items: CreateOrderFromCheckoutInput["items"],
): boolean {
  return items.every(
    (item) =>
      item.quantity > 0 &&
      isNonNegativeMoney(item.unitPriceSnapshot) &&
      item.lineSubtotal === item.unitPriceSnapshot * item.quantity,
  );
}

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export function isFinalOrderStatus(status: OrderStatus): boolean {
  return status === "COMPLETED" || status === "CANCELLED";
}

/** MVP: cancel hanya dari PENDING atau WAITING_PAYMENT. */
export function isCancellableStatus(status: OrderStatus): boolean {
  return status === "PENDING" || status === "WAITING_PAYMENT";
}

/**
 * Customer hanya boleh cancel order miliknya sendiri.
 * Admin/SYSTEM boleh cancel order manapun (dalam status cancellable).
 */
export function canActorCancelOrder(
  order: Order,
  actor: OrderActorContext,
): boolean {
  if (actor.actorRole === "ADMIN" || actor.actorRole === "SYSTEM") {
    return true;
  }
  return actor.actorRole === "CUSTOMER" && actor.actorId === order.customerId;
}

/**
 * Customer tidak boleh melakukan transisi status operasional (PAID, PROCESSING, …).
 * Admin/SYSTEM boleh.
 */
export function canActorTransitionOrderStatus(
  order: Order,
  actor: OrderActorContext,
  nextStatus: OrderStatus,
): boolean {
  if (nextStatus === "CANCELLED") {
    return canActorCancelOrder(order, actor);
  }
  return actor.actorRole === "ADMIN" || actor.actorRole === "SYSTEM";
}
