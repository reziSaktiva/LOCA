import type {
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusHistory,
} from "./order-entities";

export type CreateOrderItemPersist = {
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

export type CreateOrderPersistCommand = {
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
  items: CreateOrderItemPersist[];
  /** Riwayat awal (append-only), urutan chronologis. */
  initialHistory: Array<{
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    changedBy: string;
    reason: string | null;
  }>;
  actorId: string;
};

export type UpdateOrderStatusPersistCommand = {
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedBy: string;
  reason: string | null;
};

export type ListOrdersQuery = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
};

export type ListOrdersResult = {
  items: Order[];
  total: number;
  page: number;
  limit: number;
};

export interface OrderRepository {
  findById(orderId: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  listByCustomerId(customerId: string, query: ListOrdersQuery): Promise<ListOrdersResult>;
  listAll(query: ListOrdersQuery): Promise<ListOrdersResult>;
  listItems(orderId: string): Promise<OrderItem[]>;
  listStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;
  create(command: CreateOrderPersistCommand): Promise<Order>;
  updateStatus(command: UpdateOrderStatusPersistCommand): Promise<Order>;
  /** Compensating delete jika persist gagal setelah reserve (jarang dipakai). */
  deleteById(orderId: string): Promise<void>;
}
