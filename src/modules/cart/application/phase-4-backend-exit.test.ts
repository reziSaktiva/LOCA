/**
 * M6.5 — Phase 4 Backend Exit Validation
 *
 * Smoke + contract checks yang mengunci exit criteria Phase 4 backend:
 * 1. Flow cart terpadu (add → stock check → total → remove → empty)
 * 2. Kontrak lintas module siap dikonsumsi Phase 5 (checkout / order)
 * 3. Cart hanya bergantung pada catalog + inventory via port / public facade
 */

import { describe, expect, it } from "vitest";
import type { Cart, CartItem } from "../domain/cart-entities";
import type {
  AddCartItemCommand,
  CartRepository,
  UpdateCartItemQuantityCommand,
  UpdateCartItemVariantCommand,
} from "../domain/cart-repository";
import {
  getCartSnapshotForCheckout,
  cartAddItem,
  cartClear,
  cartGetSnapshot,
  cartRemoveItem,
  cartUpdateItemQuantity,
} from "../public/cart-service";
import {
  inventoryAssertStockAvailable,
  inventoryCommitStock,
  inventoryReleaseReservedStock,
  inventoryReserveStock,
} from "../../inventory/public/inventory-service";
import type { CartCatalogPort, CartInventoryPort, CartVariant } from "./cart-ports";
import { getCartSnapshot } from "./get-cart";
import { addItemToCart, removeCartItem } from "./manage-cart-item";

// ---------------------------------------------------------------------------
// In-memory helpers (application-layer smoke — tidak menyentuh DB)
// ---------------------------------------------------------------------------

function makeCart(override: Partial<Cart> = {}): Cart {
  return {
    id: "cart-exit-1",
    customerId: "customer-exit-1",
    cartStatus: "ACTIVE",
    currency: "IDR",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

function makeCartItem(override: Partial<CartItem> = {}): CartItem {
  const quantity = override.quantity ?? 1;
  const unitPriceSnapshot = override.unitPriceSnapshot ?? 150000;
  return {
    id: "item-exit-1",
    cartId: "cart-exit-1",
    variantId: "var-exit-1",
    quantity,
    unitPriceSnapshot,
    lineSubtotal: quantity * unitPriceSnapshot,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

class InMemoryCartRepository implements CartRepository {
  private carts: Cart[] = [];
  private items: CartItem[] = [];
  private cartCounter = 0;
  private itemCounter = 0;

  async findCartById(cartId: string) {
    return this.carts.find((c) => c.id === cartId) ?? null;
  }

  async findActiveCartByCustomerId(customerId: string) {
    return this.carts.find((c) => c.customerId === customerId && c.cartStatus === "ACTIVE") ?? null;
  }

  async createCart(customerId: string) {
    this.cartCounter += 1;
    const cart = makeCart({
      id: `cart-exit-${this.cartCounter}`,
      customerId,
    });
    this.carts.push(cart);
    return cart;
  }

  async findCartItems(cartId: string) {
    return this.items.filter((i) => i.cartId === cartId);
  }

  async findCartItemById(itemId: string) {
    return this.items.find((i) => i.id === itemId) ?? null;
  }

  async findCartItemByVariantId(cartId: string, variantId: string) {
    return this.items.find((i) => i.cartId === cartId && i.variantId === variantId) ?? null;
  }

  async addItem(command: AddCartItemCommand) {
    this.itemCounter += 1;
    const item = makeCartItem({
      id: `item-exit-${this.itemCounter}`,
      cartId: command.cartId,
      variantId: command.variantId,
      quantity: command.quantity,
      unitPriceSnapshot: command.unitPriceSnapshot,
      lineSubtotal: command.lineSubtotal,
    });
    this.items.push(item);
    return item;
  }

  async updateItemQuantity(command: UpdateCartItemQuantityCommand) {
    const idx = this.items.findIndex((i) => i.id === command.itemId);
    if (idx < 0) throw new Error("Item not found");
    const updated: CartItem = {
      ...this.items[idx],
      quantity: command.quantity,
      lineSubtotal: command.lineSubtotal,
      updatedAt: new Date(),
    };
    this.items[idx] = updated;
    return updated;
  }

  async updateItemVariant(command: UpdateCartItemVariantCommand) {
    const idx = this.items.findIndex((i) => i.id === command.itemId);
    if (idx < 0) throw new Error("Item not found");
    const updated: CartItem = {
      ...this.items[idx],
      variantId: command.variantId,
      unitPriceSnapshot: command.unitPriceSnapshot,
      lineSubtotal: command.lineSubtotal,
      updatedAt: new Date(),
    };
    this.items[idx] = updated;
    return updated;
  }

  async removeItem(itemId: string) {
    this.items = this.items.filter((i) => i.id !== itemId);
  }

  async clearItems(cartId: string) {
    this.items = this.items.filter((i) => i.cartId !== cartId);
  }
}

function makeVariant(override: Partial<CartVariant> & Pick<CartVariant, "variantId">): CartVariant {
  return {
    price: 150000,
    status: "ACTIVE",
    productName: "Exit Gate Tee",
    variantLabel: "M",
    thumbnailUrl: "/exit-tee.jpg",
    ...override,
  };
}

function makeCatalogPort(variants: CartVariant[]): CartCatalogPort {
  return {
    async getVariantSnapshot(variantId) {
      return variants.find((v) => v.variantId === variantId) ?? null;
    },
  };
}

function makeInventoryPort(stockByVariant: Record<string, number>): CartInventoryPort {
  return {
    async assertStockAvailable(variantId, qty) {
      const available = stockByVariant[variantId] ?? 0;
      if (available >= qty) return { success: true };
      return {
        success: false,
        message: `Stok tidak mencukupi. Tersedia: ${available}, diminta: ${qty}.`,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Integration smoke — application layer via ports
// ---------------------------------------------------------------------------

describe("Phase 4 backend exit — cart flow smoke", () => {
  it("addItem → stock validated → cart total calculated → item removed → cart empty", async () => {
    const repo = new InMemoryCartRepository();
    const catalogPort = makeCatalogPort([makeVariant({ variantId: "var-exit-1", price: 150000 })]);
    const inventoryPort = makeInventoryPort({ "var-exit-1": 5 });
    const customerId = "customer-exit-1";

    // 1) Add item — stok divalidasi via inventory port
    const addResult = await addItemToCart(repo, catalogPort, inventoryPort, {
      customerId,
      variantId: "var-exit-1",
      quantity: 2,
    });
    expect(addResult.success).toBe(true);
    if (!addResult.success) return;

    expect(addResult.data.quantity).toBe(2);
    expect(addResult.data.lineSubtotal).toBe(300000);

    // 2) Snapshot — total dihitung
    const snapshotAfterAdd = await getCartSnapshot(repo, customerId);
    expect(snapshotAfterAdd.items).toHaveLength(1);
    expect(snapshotAfterAdd.subtotal).toBe(300000);
    expect(snapshotAfterAdd.total).toBe(300000);

    // 3) Stok tidak cukup ditolak
    const overStock = await addItemToCart(repo, catalogPort, inventoryPort, {
      customerId,
      variantId: "var-exit-1",
      quantity: 10,
    });
    expect(overStock.success).toBe(false);
    if (!overStock.success) {
      expect(overStock.error.code).toBe("INSUFFICIENT_STOCK");
    }

    // 4) Remove item → cart kosong
    const removeResult = await removeCartItem(repo, {
      customerId,
      itemId: addResult.data.id,
    });
    expect(removeResult.success).toBe(true);

    const snapshotAfterRemove = await getCartSnapshot(repo, customerId);
    expect(snapshotAfterRemove.items).toHaveLength(0);
    expect(snapshotAfterRemove.subtotal).toBe(0);
    expect(snapshotAfterRemove.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Phase 5 readiness — public facade contract surface
// (hanya memverifikasi export; tidak memanggil DB)
// ---------------------------------------------------------------------------

describe("Phase 4 backend exit — Phase 5 readiness contracts", () => {
  it("cart public facade exposes getCartSnapshotForCheckout and cart mutations", () => {
    expect(typeof getCartSnapshotForCheckout).toBe("function");
    expect(typeof cartGetSnapshot).toBe("function");
    expect(typeof cartAddItem).toBe("function");
    expect(typeof cartUpdateItemQuantity).toBe("function");
    expect(typeof cartRemoveItem).toBe("function");
    expect(typeof cartClear).toBe("function");
  });

  it("inventory public facade exposes reserve/commit/release for order lifecycle", () => {
    expect(typeof inventoryAssertStockAvailable).toBe("function");
    expect(typeof inventoryReserveStock).toBe("function");
    expect(typeof inventoryCommitStock).toBe("function");
    expect(typeof inventoryReleaseReservedStock).toBe("function");
  });
});
