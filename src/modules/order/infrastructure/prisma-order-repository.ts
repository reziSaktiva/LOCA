import type {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatusHistory as PrismaOrderStatusHistory,
} from "../../../generated/prisma/client";
import { prisma } from "../../../shared/infrastructure/database/client";
import type { Order, OrderItem, OrderStatusHistory } from "../domain/order-entities";
import type {
  CreateOrderPersistCommand,
  ListOrdersQuery,
  ListOrdersResult,
  OrderRepository,
  UpdateOrderStatusPersistCommand,
} from "../domain/order-repository";

function toOrder(row: PrismaOrder): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customerId: row.customerId,
    checkoutSessionId: row.checkoutSessionId,
    orderStatus: row.orderStatus,
    currency: row.currency,
    subtotal: row.subtotal,
    shippingFee: row.shippingFee,
    discountTotal: row.discountTotal,
    grandTotal: row.grandTotal,
    shippingRecipientName: row.shippingRecipientName,
    shippingPhone: row.shippingPhone,
    shippingStreet: row.shippingStreet,
    shippingDistrict: row.shippingDistrict,
    shippingCity: row.shippingCity,
    shippingProvince: row.shippingProvince,
    shippingPostalCode: row.shippingPostalCode,
    shippingProvider: row.shippingProvider,
    shippingServiceCode: row.shippingServiceCode,
    shippingServiceName: row.shippingServiceName,
    paymentMethod: row.paymentMethod,
    paymentMethodLabel: row.paymentMethodLabel,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toItem(row: PrismaOrderItem): OrderItem {
  return {
    id: row.id,
    orderId: row.orderId,
    variantId: row.variantId,
    productNameSnapshot: row.productNameSnapshot,
    skuSnapshot: row.skuSnapshot,
    variantLabelSnapshot: row.variantLabelSnapshot,
    thumbnailSnapshot: row.thumbnailSnapshot,
    categorySnapshot: row.categorySnapshot,
    brandSnapshot: row.brandSnapshot,
    unitPriceSnapshot: row.unitPriceSnapshot,
    quantity: row.quantity,
    lineTotal: row.lineTotal,
  };
}

function toHistory(row: PrismaOrderStatusHistory): OrderStatusHistory {
  return {
    id: row.id,
    orderId: row.orderId,
    fromStatus: row.fromStatus,
    toStatus: row.toStatus,
    changedAt: row.changedAt,
    changedBy: row.changedBy,
    reason: row.reason,
  };
}

function normalizePaging(query: ListOrdersQuery): { page: number; limit: number } {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
  return { page, limit };
}

export class PrismaOrderRepository implements OrderRepository {
  async findById(orderId: string): Promise<Order | null> {
    const row = await prisma.order.findUnique({ where: { id: orderId } });
    return row ? toOrder(row) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const row = await prisma.order.findUnique({ where: { orderNumber } });
    return row ? toOrder(row) : null;
  }

  async listByCustomerId(customerId: string, query: ListOrdersQuery): Promise<ListOrdersResult> {
    const { page, limit } = normalizePaging(query);
    const where = {
      customerId,
      ...(query.status ? { orderStatus: query.status } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { items: rows.map(toOrder), total, page, limit };
  }

  async listAll(query: ListOrdersQuery): Promise<ListOrdersResult> {
    const { page, limit } = normalizePaging(query);
    const where = query.status ? { orderStatus: query.status } : {};
    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { items: rows.map(toOrder), total, page, limit };
  }

  async listItems(orderId: string): Promise<OrderItem[]> {
    const rows = await prisma.orderItem.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toItem);
  }

  async listStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const rows = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { changedAt: "asc" },
    });
    return rows.map(toHistory);
  }

  async create(command: CreateOrderPersistCommand): Promise<Order> {
    const row = await prisma.order.create({
      data: {
        id: command.id,
        orderNumber: command.orderNumber,
        customerId: command.customerId,
        checkoutSessionId: command.checkoutSessionId,
        orderStatus: command.orderStatus,
        currency: command.currency,
        subtotal: command.subtotal,
        shippingFee: command.shippingFee,
        discountTotal: command.discountTotal,
        grandTotal: command.grandTotal,
        shippingRecipientName: command.shippingRecipientName,
        shippingPhone: command.shippingPhone,
        shippingStreet: command.shippingStreet,
        shippingDistrict: command.shippingDistrict,
        shippingCity: command.shippingCity,
        shippingProvince: command.shippingProvince,
        shippingPostalCode: command.shippingPostalCode,
        shippingProvider: command.shippingProvider,
        shippingServiceCode: command.shippingServiceCode,
        shippingServiceName: command.shippingServiceName,
        paymentMethod: command.paymentMethod,
        paymentMethodLabel: command.paymentMethodLabel,
        createdBy: command.actorId,
        updatedBy: command.actorId,
        items: {
          create: command.items.map((item) => ({
            variantId: item.variantId,
            productNameSnapshot: item.productNameSnapshot,
            skuSnapshot: item.skuSnapshot,
            variantLabelSnapshot: item.variantLabelSnapshot,
            thumbnailSnapshot: item.thumbnailSnapshot,
            categorySnapshot: item.categorySnapshot,
            brandSnapshot: item.brandSnapshot,
            unitPriceSnapshot: item.unitPriceSnapshot,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            createdBy: command.actorId,
            updatedBy: command.actorId,
          })),
        },
        statusHistory: {
          create: command.initialHistory.map((entry) => ({
            fromStatus: entry.fromStatus,
            toStatus: entry.toStatus,
            changedBy: entry.changedBy,
            reason: entry.reason,
          })),
        },
      },
    });
    return toOrder(row);
  }

  async updateStatus(command: UpdateOrderStatusPersistCommand): Promise<Order> {
    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: command.orderId },
        data: {
          orderStatus: command.toStatus,
          updatedBy: command.changedBy,
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: command.orderId,
          fromStatus: command.fromStatus,
          toStatus: command.toStatus,
          changedBy: command.changedBy,
          reason: command.reason,
        },
      });
      return updated;
    });
    return toOrder(row);
  }

  async deleteById(orderId: string): Promise<void> {
    await prisma.order.delete({ where: { id: orderId } });
  }
}
