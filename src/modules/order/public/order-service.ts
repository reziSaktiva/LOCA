/**
 * Order Public Service / Facade
 *
 * Entry point untuk consumer lintas module (Checkout, Payment, Shipping, API layer).
 * Semua akses ke Order harus melalui fungsi di file ini.
 */

import { getVariantSnapshotForCart } from "../../catalog/public/catalog-public-service";
import {
  inventoryReleaseReservedStock,
  inventoryReserveStock,
} from "../../inventory/public/inventory-service";
import { cancelOrder } from "../application/cancel-order";
import { createOrderFromCheckout as createOrderFromCheckoutUseCase } from "../application/create-order-from-checkout";
import { getOrderDetail } from "../application/get-order";
import type { OrderCatalogPort, OrderInventoryPort } from "../application/order-ports";
import { transitionOrderStatus } from "../application/transition-order-status";
import type {
  CancelOrderCommand,
  CreateOrderFromCheckoutInput,
  Order,
  OrderDetail,
  OrderResult,
  TransitionOrderStatusCommand,
} from "../domain/order-entities";
import type { ListOrdersQuery, ListOrdersResult } from "../domain/order-repository";
import { PrismaOrderRepository } from "../infrastructure/prisma-order-repository";

export {
  ORDER_STATUSES,
  type CancelOrderCommand,
  type CreateOrderFromCheckoutInput,
  type Order,
  type OrderActorContext,
  type OrderActorRole,
  type OrderDetail,
  type OrderError,
  type OrderItem,
  type OrderResult,
  type OrderStatus,
  type OrderStatusHistory,
  type TransitionOrderStatusCommand,
} from "../domain/order-entities";

export type { ListOrdersQuery, ListOrdersResult } from "../domain/order-repository";

const repository = new PrismaOrderRepository();

function makeCatalogPort(): OrderCatalogPort {
  return {
    async getVariantSnapshot(variantId) {
      const snapshot = await getVariantSnapshotForCart(variantId);
      if (!snapshot) return null;
      return {
        variantId: snapshot.variantId,
        sku: snapshot.sku,
        productName: snapshot.productName,
        variantLabel: snapshot.variantLabel,
        thumbnailUrl: snapshot.thumbnailUrl,
        brand: snapshot.brand,
        categoryName: snapshot.categoryName,
        status: snapshot.status,
      };
    },
  };
}

function makeInventoryPort(): OrderInventoryPort {
  return {
    async reserveStock(input) {
      const result = await inventoryReserveStock({
        orderId: input.orderId,
        items: input.items,
        actorId: input.actorId,
      });
      if (result.success) return { success: true };
      return {
        success: false,
        code: result.error.code,
        message: result.error.message,
      };
    },
    async releaseReservedStock(input) {
      const result = await inventoryReleaseReservedStock({
        orderId: input.orderId,
        actorId: input.actorId,
      });
      if (result.success) return { success: true };
      return {
        success: false,
        code: result.error.code,
        message: result.error.message,
      };
    },
  };
}

/**
 * Membuat order dari checkout snapshot hingga WAITING_PAYMENT + reserve stock.
 * Consumer utama: CheckoutOrderPort (module checkout).
 */
export async function createOrderFromCheckout(
  input: CreateOrderFromCheckoutInput,
): Promise<OrderResult<Order>> {
  return createOrderFromCheckoutUseCase(
    repository,
    makeCatalogPort(),
    makeInventoryPort(),
    input,
  );
}

/** Facade name selaras docs/05. */
export async function orderCreateFromCheckout(
  input: CreateOrderFromCheckoutInput,
): Promise<OrderResult<Order>> {
  return createOrderFromCheckout(input);
}

export async function orderGetDetail(orderId: string): Promise<OrderResult<OrderDetail>> {
  return getOrderDetail(repository, orderId);
}

/** Facade name selaras docs/05 — getOrder. */
export async function getOrder(
  orderId: string,
): Promise<OrderResult<OrderDetail>> {
  return orderGetDetail(orderId);
}

export async function orderListForCustomer(
  customerId: string,
  query: ListOrdersQuery = {},
): Promise<ListOrdersResult> {
  return repository.listByCustomerId(customerId, query);
}

/** Facade name selaras docs/05 — listCustomerOrders. */
export async function listCustomerOrders(
  customerId: string,
  query: ListOrdersQuery = {},
): Promise<ListOrdersResult> {
  return orderListForCustomer(customerId, query);
}

export async function orderListForAdmin(query: ListOrdersQuery = {}): Promise<ListOrdersResult> {
  return repository.listAll(query);
}

/** Facade name selaras docs/05 — listOrdersForAdmin. */
export async function listOrdersForAdmin(query: ListOrdersQuery = {}): Promise<ListOrdersResult> {
  return orderListForAdmin(query);
}

export async function orderTransitionStatus(
  command: TransitionOrderStatusCommand,
): Promise<OrderResult<Order>> {
  return transitionOrderStatus(repository, command);
}

/** Facade name selaras docs/05 — transitionOrderStatus. */
export async function transitionOrderStatusForActor(
  command: TransitionOrderStatusCommand,
): Promise<OrderResult<Order>> {
  return orderTransitionStatus(command);
}

export async function orderCancel(command: CancelOrderCommand): Promise<OrderResult<Order>> {
  return cancelOrder(repository, makeInventoryPort(), command);
}

/** Facade name selaras docs/05 — cancelOrder. */
export async function cancelOrderForActor(
  command: CancelOrderCommand,
): Promise<OrderResult<Order>> {
  return orderCancel(command);
}
