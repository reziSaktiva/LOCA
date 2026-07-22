// ---------------------------------------------------------------------------
// Order Module — Domain Entities
// Sesuai docs/06-data-model.md §6.7 / §9.1 dan docs/05-domain-modules.md §11
// ---------------------------------------------------------------------------

export const ORDER_STATUSES = [
  "PENDING",
  "WAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Allowed transitions — docs/06-data-model.md §9.1.
 * COMPLETED dan CANCELLED adalah final.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["WAITING_PAYMENT", "CANCELLED"],
  WAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export type OrderActorRole = "CUSTOMER" | "ADMIN" | "SYSTEM";

export type OrderActorContext = {
  actorId: string;
  actorRole: OrderActorRole;
};

/** Aggregate root: transaksi pembelian. */
export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  checkoutSessionId: string | null;
  orderStatus: OrderStatus;
  currency: string;
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  grandTotal: number;
  shippingRecipientName: string;
  shippingPhone: string;
  shippingStreet: string;
  shippingDistrict: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  shippingProvider: string;
  shippingServiceCode: string;
  shippingServiceName: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Item order — snapshot immutable saat order dibuat. */
export type OrderItem = {
  id: string;
  orderId: string;
  variantId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  variantLabelSnapshot: string;
  thumbnailSnapshot: string;
  categorySnapshot: string;
  brandSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
};

/** Riwayat status append-only (docs: OrderStatusHistory / OrderTimeline). */
export type OrderStatusHistory = {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedAt: Date;
  changedBy: string;
  reason: string | null;
};

/**
 * Input create dari checkout snapshot.
 * Shape selaras CheckoutSnapshot — didefinisikan di order agar tidak create circular import.
 */
export type CreateOrderFromCheckoutInput = {
  sessionId: string;
  customerId: string;
  cartId: string;
  currency: string;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPriceSnapshot: number;
    lineSubtotal: number;
  }>;
  itemsSubtotal: number;
  shippingFee: number;
  grandTotal: number;
  address: {
    addressId: string;
    recipientName: string;
    phone: string;
    street: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
  };
  shipping: {
    optionId: string;
    provider: string;
    serviceCode: string;
    serviceName: string;
    estimatedDays: number | null;
    shippingFee: number;
  };
  payment: {
    method: string;
    label: string;
  };
};

export type TransitionOrderStatusCommand = {
  orderId: string;
  nextStatus: OrderStatus;
  actor: OrderActorContext;
  reason?: string;
};

export type CancelOrderCommand = {
  orderId: string;
  actor: OrderActorContext;
  reason: string;
};

export type OrderError =
  | { code: "ORDER_NOT_FOUND"; message: string }
  | { code: "EMPTY_ORDER"; message: string }
  | { code: "INVALID_TOTAL"; message: string }
  | { code: "CURRENCY_MISMATCH"; message: string }
  | { code: "VARIANT_NOT_FOUND"; message: string }
  | { code: "INSUFFICIENT_STOCK"; message: string }
  | { code: "STOCK_RESERVE_FAILED"; message: string }
  | { code: "ILLEGAL_STATUS_TRANSITION"; message: string }
  | { code: "ORDER_NOT_CANCELLABLE"; message: string }
  | { code: "FORBIDDEN"; message: string }
  | { code: "ORDER_CREATE_FAILED"; message: string };

export type OrderResult<T> = { success: true; data: T } | { success: false; error: OrderError };

/** Order + items untuk read model foundation. */
export type OrderDetail = {
  order: Order;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
};
