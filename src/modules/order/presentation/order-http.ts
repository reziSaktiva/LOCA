import { ORDER_STATUSES, type OrderError, type OrderStatus } from "../domain/order-entities";
import { isCancellableStatus } from "../domain/order-invariants";
import type { ListOrdersQuery } from "../domain/order-repository";

/** Maps domain order error codes to HTTP status for customer/admin API routes. */
export function orderErrorStatus(error: OrderError): number {
  switch (error.code) {
    case "ORDER_NOT_FOUND":
    case "VARIANT_NOT_FOUND":
      return 404;
    case "FORBIDDEN":
      return 403;
    case "ILLEGAL_STATUS_TRANSITION":
    case "ORDER_NOT_CANCELLABLE":
    case "INSUFFICIENT_STOCK":
    case "STOCK_RESERVE_FAILED":
    case "ORDER_CREATE_FAILED":
      return 409;
    case "EMPTY_ORDER":
    case "INVALID_TOTAL":
    case "CURRENCY_MISMATCH":
      return 400;
  }
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Dipakai UI untuk menampilkan/menyembunyikan CTA "Batalkan Pesanan". */
export function isOrderCancellable(status: OrderStatus): boolean {
  return isCancellableStatus(status);
}

/** Parse `page`, `limit`, `status` from URL search params for order list endpoints. */
export function parseOrderListQuery(searchParams: URLSearchParams): ListOrdersQuery {
  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");
  const statusRaw = searchParams.get("status");

  const page = pageRaw ? Number(pageRaw) : undefined;
  const limit = limitRaw ? Number(limitRaw) : undefined;

  return {
    ...(page !== undefined && Number.isFinite(page) ? { page } : {}),
    ...(limit !== undefined && Number.isFinite(limit) ? { limit } : {}),
    ...(isOrderStatus(statusRaw) ? { status: statusRaw } : {}),
  };
}
