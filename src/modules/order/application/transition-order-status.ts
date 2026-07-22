import type { Order, OrderResult, TransitionOrderStatusCommand } from "../domain/order-entities";
import {
  canActorTransitionOrderStatus,
  canTransitionOrderStatus,
  isFinalOrderStatus,
} from "../domain/order-invariants";
import type { OrderRepository } from "../domain/order-repository";

/**
 * Transisi status order sesuai state machine docs/06 §9.1.
 * Setiap transisi menulis OrderStatusHistory (append-only) di repository.
 */
export async function transitionOrderStatus(
  repository: OrderRepository,
  command: TransitionOrderStatusCommand,
): Promise<OrderResult<Order>> {
  const order = await repository.findById(command.orderId);
  if (!order) {
    return {
      success: false,
      error: { code: "ORDER_NOT_FOUND", message: `Order ${command.orderId} was not found.` },
    };
  }

  if (isFinalOrderStatus(order.orderStatus)) {
    return {
      success: false,
      error: {
        code: "ILLEGAL_STATUS_TRANSITION",
        message: `Order in final status ${order.orderStatus} cannot transition.`,
      },
    };
  }

  if (!canTransitionOrderStatus(order.orderStatus, command.nextStatus)) {
    return {
      success: false,
      error: {
        code: "ILLEGAL_STATUS_TRANSITION",
        message: `Cannot transition from ${order.orderStatus} to ${command.nextStatus}.`,
      },
    };
  }

  if (!canActorTransitionOrderStatus(order, command.actor, command.nextStatus)) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Actor is not allowed to perform this status transition.",
      },
    };
  }

  const updated = await repository.updateStatus({
    orderId: order.id,
    fromStatus: order.orderStatus,
    toStatus: command.nextStatus,
    changedBy: command.actor.actorId,
    reason: command.reason ?? null,
  });

  return { success: true, data: updated };
}
