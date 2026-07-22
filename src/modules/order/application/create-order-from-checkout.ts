import type {
  CreateOrderFromCheckoutInput,
  Order,
  OrderResult,
} from "../domain/order-entities";
import {
  areLineTotalsConsistent,
  hasAtLeastOneItem,
  isCurrencyConsistent,
  isGrandTotalConsistent,
  isNonNegativeMoney,
} from "../domain/order-invariants";
import type { OrderRepository } from "../domain/order-repository";
import type { OrderCatalogPort, OrderInventoryPort } from "./order-ports";

function generateOrderNumber(now = new Date()): string {
  const yyyy = now.getUTCFullYear().toString();
  const mm = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = now.getUTCDate().toString().padStart(2, "0");
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `LOC-${yyyy}${mm}${dd}-${suffix}`;
}

/**
 * Membuat order dari checkout snapshot hingga WAITING_PAYMENT + reserve stock.
 *
 * Atomic appearance (acceptance M7.2):
 * 1) Validasi + enrich catalog
 * 2) Reserve stock dulu (butuh orderId)
 * 3) Persist order; jika gagal → release stock (compensating)
 */
export async function createOrderFromCheckout(
  repository: OrderRepository,
  catalogPort: OrderCatalogPort,
  inventoryPort: OrderInventoryPort,
  input: CreateOrderFromCheckoutInput,
): Promise<OrderResult<Order>> {
  if (!hasAtLeastOneItem(input.items.length)) {
    return {
      success: false,
      error: { code: "EMPTY_ORDER", message: "Order must have at least one item." },
    };
  }

  if (!isCurrencyConsistent(input.currency)) {
    return {
      success: false,
      error: {
        code: "CURRENCY_MISMATCH",
        message: `Unsupported or inconsistent currency: ${input.currency}.`,
      },
    };
  }

  if (
    !isNonNegativeMoney(input.itemsSubtotal) ||
    !isNonNegativeMoney(input.shippingFee) ||
    !isNonNegativeMoney(input.grandTotal)
  ) {
    return {
      success: false,
      error: { code: "INVALID_TOTAL", message: "Order totals must be non-negative." },
    };
  }

  if (!areLineTotalsConsistent(input.items)) {
    return {
      success: false,
      error: {
        code: "INVALID_TOTAL",
        message: "Line totals are inconsistent with unit price and quantity.",
      },
    };
  }

  const discountTotal = 0;
  if (
    !isGrandTotalConsistent({
      itemsSubtotal: input.itemsSubtotal,
      shippingFee: input.shippingFee,
      discountTotal,
      grandTotal: input.grandTotal,
    })
  ) {
    return {
      success: false,
      error: {
        code: "INVALID_TOTAL",
        message: "grandTotal must equal itemsSubtotal + shippingFee - discountTotal.",
      },
    };
  }

  const enrichedItems = [];
  for (const item of input.items) {
    const variant = await catalogPort.getVariantSnapshot(item.variantId);
    if (!variant) {
      return {
        success: false,
        error: {
          code: "VARIANT_NOT_FOUND",
          message: `Variant ${item.variantId} was not found in catalog.`,
        },
      };
    }
    enrichedItems.push({
      variantId: item.variantId,
      productNameSnapshot: variant.productName,
      skuSnapshot: variant.sku,
      variantLabelSnapshot: variant.variantLabel,
      thumbnailSnapshot: variant.thumbnailUrl,
      categorySnapshot: variant.categoryName,
      brandSnapshot: variant.brand,
      unitPriceSnapshot: item.unitPriceSnapshot,
      quantity: item.quantity,
      lineTotal: item.lineSubtotal,
    });
  }

  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  const actorId = input.customerId;

  const reserveResult = await inventoryPort.reserveStock({
    orderId,
    actorId,
    items: enrichedItems.map((item) => ({
      variantId: item.variantId,
      qty: item.quantity,
    })),
  });

  if (!reserveResult.success) {
    if (reserveResult.code === "INSUFFICIENT_STOCK") {
      return {
        success: false,
        error: {
          code: "INSUFFICIENT_STOCK",
          message: reserveResult.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: "STOCK_RESERVE_FAILED",
        message: reserveResult.message,
      },
    };
  }

  try {
    const order = await repository.create({
      id: orderId,
      orderNumber,
      customerId: input.customerId,
      checkoutSessionId: input.sessionId,
      orderStatus: "WAITING_PAYMENT",
      currency: input.currency,
      subtotal: input.itemsSubtotal,
      shippingFee: input.shippingFee,
      discountTotal,
      grandTotal: input.grandTotal,
      shippingRecipientName: input.address.recipientName,
      shippingPhone: input.address.phone,
      shippingStreet: input.address.street,
      shippingDistrict: input.address.district,
      shippingCity: input.address.city,
      shippingProvince: input.address.province,
      shippingPostalCode: input.address.postalCode,
      shippingProvider: input.shipping.provider,
      shippingServiceCode: input.shipping.serviceCode,
      shippingServiceName: input.shipping.serviceName,
      paymentMethod: input.payment.method,
      paymentMethodLabel: input.payment.label,
      items: enrichedItems,
      initialHistory: [
        {
          fromStatus: null,
          toStatus: "PENDING",
          changedBy: actorId,
          reason: "Order created from checkout",
        },
        {
          fromStatus: "PENDING",
          toStatus: "WAITING_PAYMENT",
          changedBy: actorId,
          reason: "Awaiting payment",
        },
      ],
      actorId,
    });

    return { success: true, data: order };
  } catch (error) {
    await inventoryPort.releaseReservedStock({ orderId, actorId });
    const message = error instanceof Error ? error.message : "Failed to persist order.";
    return {
      success: false,
      error: { code: "ORDER_CREATE_FAILED", message },
    };
  }
}
