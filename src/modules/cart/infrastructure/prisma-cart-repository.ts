import type {
  Cart as PrismaCart,
  CartItem as PrismaCartItem,
} from "../../../generated/prisma/client";
import { prisma } from "../../../shared/infrastructure/database/client";
import type { Cart, CartItem } from "../domain/cart-entities";
import type {
  AddCartItemCommand,
  CartRepository,
  UpdateCartItemQuantityCommand,
  UpdateCartItemVariantCommand,
} from "../domain/cart-repository";

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function toCart(row: PrismaCart): Cart {
  return {
    id: row.id,
    customerId: row.customerId,
    cartStatus: row.cartStatus,
    currency: row.currency,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toCartItem(row: PrismaCartItem): CartItem {
  return {
    id: row.id,
    cartId: row.cartId,
    variantId: row.variantId,
    quantity: row.quantity,
    unitPriceSnapshot: row.unitPriceSnapshot,
    lineSubtotal: row.lineSubtotal,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------

export class PrismaCartRepository implements CartRepository {
  async findCartById(cartId: string): Promise<Cart | null> {
    const row = await prisma.cart.findUnique({ where: { id: cartId } });
    return row ? toCart(row) : null;
  }

  async findActiveCartByCustomerId(customerId: string): Promise<Cart | null> {
    const row = await prisma.cart.findFirst({
      where: { customerId, cartStatus: "ACTIVE" },
    });
    return row ? toCart(row) : null;
  }

  async createCart(customerId: string, currency: string): Promise<Cart> {
    const row = await prisma.cart.create({
      data: {
        customerId,
        currency,
        cartStatus: "ACTIVE",
        createdBy: customerId,
        updatedBy: customerId,
      },
    });
    return toCart(row);
  }

  async findCartItems(cartId: string): Promise<CartItem[]> {
    const rows = await prisma.cartItem.findMany({
      where: { cartId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toCartItem);
  }

  async findCartItemById(itemId: string): Promise<CartItem | null> {
    const row = await prisma.cartItem.findUnique({ where: { id: itemId } });
    return row ? toCartItem(row) : null;
  }

  async findCartItemByVariantId(cartId: string, variantId: string): Promise<CartItem | null> {
    const row = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId, variantId } },
    });
    return row ? toCartItem(row) : null;
  }

  async addItem(command: AddCartItemCommand): Promise<CartItem> {
    const row = await prisma.cartItem.create({
      data: {
        cartId: command.cartId,
        variantId: command.variantId,
        quantity: command.quantity,
        unitPriceSnapshot: command.unitPriceSnapshot,
        lineSubtotal: command.lineSubtotal,
      },
    });
    return toCartItem(row);
  }

  async updateItemQuantity(command: UpdateCartItemQuantityCommand): Promise<CartItem> {
    const row = await prisma.cartItem.update({
      where: { id: command.itemId },
      data: {
        quantity: command.quantity,
        lineSubtotal: command.lineSubtotal,
      },
    });
    return toCartItem(row);
  }

  async updateItemVariant(command: UpdateCartItemVariantCommand): Promise<CartItem> {
    const row = await prisma.cartItem.update({
      where: { id: command.itemId },
      data: {
        variantId: command.variantId,
        unitPriceSnapshot: command.unitPriceSnapshot,
        lineSubtotal: command.lineSubtotal,
      },
    });
    return toCartItem(row);
  }

  async removeItem(itemId: string): Promise<void> {
    await prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearItems(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
