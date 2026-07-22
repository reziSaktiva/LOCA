import type { CancelOrderCommand, Order, OrderResult } from "../domain/order-entities";
import {
  canActorCancelOrder,
  isCancellableStatus,
} from "../domain/order-invariants";
import type { OrderRepository } from "../domain/order-repository";
import type { OrderInventoryPort } from "./order-ports";

/**
 * Membatalkan order (PENDING / WAITING_PAYMENT) dan me-release reserved stock.
 * Policy MVP: customer hanya order sendiri; admin/system boleh semua.
 */
export async function cancelOrder(
  repository: OrderRepository,
  inventoryPort: OrderInventoryPort,
  command: CancelOrderCommand,
): Promise<OrderResult<Order>> {
  const order = await repository.findById(command.orderId);
  if (!order) {
    return {
      success: false,
      error: { code: "ORDER_NOT_FOUND", message: `Order ${command.orderId} was not found.` },
    };
  }

  if (!isCancellableStatus(order.orderStatus)) {
    return {
      success: false,
      error: {
        code: "ORDER_NOT_CANCELLABLE",
        message: `Order in status ${order.orderStatus} cannot be cancelled.`,
      },
    };
  }

  if (!canActorCancelOrder(order, command.actor)) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Actor is not allowed to cancel this order.",
      },
    };
  }

  const reason = command.reason.trim();
  if (!reason) {
    return {
      success: false,
      error: {
        code: "ORDER_NOT_CANCELLABLE",
        message: "Cancel reason is required.",
      },
    };
  }

  // Release stock sebelum/bersamaan dengan status update.
  // Jika tidak ada reservasi aktif, tetap lanjut cancel (idempotent-ish untuk edge case).
  const releaseResult = await inventoryPort.releaseReservedStock({
    orderId: order.id,
    actorId: command.actor.actorId,
  });
  if (!releaseResult.success && releaseResult.code !== "RESERVATION_NOT_FOUND") {
    return {
      success: false,
      error: {
        code: "STOCK_RESERVE_FAILED",
        message: releaseResult.message,
      },
    };
  }

  const updated = await repository.updateStatus({
    orderId: order.id,
    fromStatus: order.orderStatus,
    toStatus: "CANCELLED",
    changedBy: command.actor.actorId,
    reason,
  });

  return { success: true, data: updated };
}
