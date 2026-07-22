import {
  Prisma,
  type CheckoutSession as PrismaCheckoutSession,
} from "../../../generated/prisma/client";
import { prisma } from "../../../shared/infrastructure/database/client";
import type { CheckoutSession, CheckoutSnapshot } from "../domain/checkout-entities";
import type {
  CheckoutRepository,
  CreateCheckoutSessionCommand,
  UpdateCheckoutSessionCommand,
} from "../domain/checkout-repository";

function toSession(row: PrismaCheckoutSession): CheckoutSession {
  return {
    id: row.id,
    customerId: row.customerId,
    cartId: row.cartId,
    checkoutStatus: row.checkoutStatus,
    selectedAddressId: row.selectedAddressId,
    selectedShippingOptionId: row.selectedShippingOptionId,
    selectedShippingServiceName: row.selectedShippingServiceName,
    selectedShippingFee: row.selectedShippingFee,
    selectedPaymentMethod: row.selectedPaymentMethod,
    currency: row.currency,
    itemsSubtotal: row.itemsSubtotal,
    shippingFee: row.shippingFee,
    grandTotal: row.grandTotal,
    orderId: row.orderId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseSnapshot(value: Prisma.JsonValue | null): CheckoutSnapshot | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as unknown as CheckoutSnapshot;
}

export class PrismaCheckoutRepository implements CheckoutRepository {
  async findById(sessionId: string): Promise<CheckoutSession | null> {
    const row = await prisma.checkoutSession.findUnique({ where: { id: sessionId } });
    return row ? toSession(row) : null;
  }

  async findOpenByCustomerId(customerId: string): Promise<CheckoutSession | null> {
    const row = await prisma.checkoutSession.findFirst({
      where: {
        customerId,
        checkoutStatus: { not: "ORDER_PLACED" },
      },
      orderBy: { createdAt: "desc" },
    });
    return row ? toSession(row) : null;
  }

  async create(command: CreateCheckoutSessionCommand): Promise<CheckoutSession> {
    const status = command.checkoutStatus ?? "STARTED";
    const itemsSubtotal = command.itemsSubtotal;
    const row = await prisma.checkoutSession.create({
      data: {
        customerId: command.customerId,
        cartId: command.cartId,
        currency: command.currency,
        itemsSubtotal,
        shippingFee: 0,
        grandTotal: itemsSubtotal,
        selectedAddressId: command.selectedAddressId ?? null,
        checkoutStatus: status,
        createdBy: command.customerId,
        updatedBy: command.customerId,
      },
    });
    return toSession(row);
  }

  async update(command: UpdateCheckoutSessionCommand): Promise<CheckoutSession> {
    const data: Prisma.CheckoutSessionUpdateInput = {};

    if (command.checkoutStatus !== undefined) data.checkoutStatus = command.checkoutStatus;
    if (command.selectedAddressId !== undefined) {
      data.selectedAddressId = command.selectedAddressId;
    }
    if (command.selectedShippingOptionId !== undefined) {
      data.selectedShippingOptionId = command.selectedShippingOptionId;
    }
    if (command.selectedShippingServiceName !== undefined) {
      data.selectedShippingServiceName = command.selectedShippingServiceName;
    }
    if (command.selectedShippingFee !== undefined) {
      data.selectedShippingFee = command.selectedShippingFee;
    }
    if (command.selectedPaymentMethod !== undefined) {
      data.selectedPaymentMethod = command.selectedPaymentMethod;
    }
    if (command.itemsSubtotal !== undefined) data.itemsSubtotal = command.itemsSubtotal;
    if (command.shippingFee !== undefined) data.shippingFee = command.shippingFee;
    if (command.grandTotal !== undefined) data.grandTotal = command.grandTotal;
    if (command.cartId !== undefined) data.cartId = command.cartId;
    if (command.orderId !== undefined) data.orderId = command.orderId;
    if (command.snapshot !== undefined) {
      data.snapshotJson =
        command.snapshot === null
          ? Prisma.JsonNull
          : (command.snapshot as unknown as Prisma.InputJsonValue);
    }

    const row = await prisma.checkoutSession.update({
      where: { id: command.sessionId },
      data,
    });
    return toSession(row);
  }

  async findSnapshot(sessionId: string): Promise<CheckoutSnapshot | null> {
    const row = await prisma.checkoutSession.findUnique({
      where: { id: sessionId },
      select: { snapshotJson: true },
    });
    if (!row) return null;
    return parseSnapshot(row.snapshotJson);
  }
}
