import type { OrderDetail, OrderResult } from "../domain/order-entities";
import type { OrderRepository } from "../domain/order-repository";

/** Mengambil detail order + items + status history. */
export async function getOrderDetail(
  repository: OrderRepository,
  orderId: string,
): Promise<OrderResult<OrderDetail>> {
  const order = await repository.findById(orderId);
  if (!order) {
    return {
      success: false,
      error: { code: "ORDER_NOT_FOUND", message: `Order ${orderId} was not found.` },
    };
  }

  const [items, statusHistory] = await Promise.all([
    repository.listItems(orderId),
    repository.listStatusHistory(orderId),
  ]);

  return {
    success: true,
    data: { order, items, statusHistory },
  };
}
