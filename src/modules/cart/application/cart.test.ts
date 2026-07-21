import { describe, expect, it } from "vitest";
import type { Cart, CartItem } from "../domain/cart-entities";
import {
  calculateCartTotal,
  calculateLineSubtotal,
  hasDuplicateVariant,
  isCartEditable,
  isValidCartAmount,
  isValidQuantity,
} from "../domain/cart-invariants";
import type {
  AddCartItemCommand,
  CartRepository,
  UpdateCartItemQuantityCommand,
  UpdateCartItemVariantCommand,
} from "../domain/cart-repository";
import type { CartCatalogPort, CartInventoryPort, CartVariant } from "./cart-ports";
import { getCartCustomerView } from "./get-cart-customer-view";
import { getCartSnapshot, getOrCreateActiveCart } from "./get-cart";
import {
  addItemToCart,
  changeCartItemVariant,
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "./manage-cart-item";

// ---------------------------------------------------------------------------
// In-memory repository & port helpers
// ---------------------------------------------------------------------------

function makeCart(override: Partial<Cart> = {}): Cart {
  return {
    id: "cart-1",
    customerId: "customer-1",
    cartStatus: "ACTIVE",
    currency: "IDR",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

function makeCartItem(override: Partial<CartItem> = {}): CartItem {
  const quantity = override.quantity ?? 2;
  const unitPriceSnapshot = override.unitPriceSnapshot ?? 100000;
  return {
    id: "item-1",
    cartId: "cart-1",
    variantId: "var-1",
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

  seedCarts(carts: Cart[]) {
    this.carts = [...carts];
    this.cartCounter = carts.length;
    return this;
  }

  seedItems(items: CartItem[]) {
    this.items = [...items];
    this.itemCounter = items.length;
    return this;
  }

  async findCartById(cartId: string) {
    return this.carts.find((c) => c.id === cartId) ?? null;
  }

  async findActiveCartByCustomerId(customerId: string) {
    return this.carts.find((c) => c.customerId === customerId && c.cartStatus === "ACTIVE") ?? null;
  }

  async createCart(customerId: string, currency: string) {
    this.cartCounter += 1;
    const cart: Cart = {
      id: `cart-${this.cartCounter}`,
      customerId,
      cartStatus: "ACTIVE",
      currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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
    const item: CartItem = {
      id: `item-${this.itemCounter}`,
      cartId: command.cartId,
      variantId: command.variantId,
      quantity: command.quantity,
      unitPriceSnapshot: command.unitPriceSnapshot,
      lineSubtotal: command.lineSubtotal,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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
    price: 100000,
    status: "ACTIVE",
    productName: "Test Product",
    variantLabel: "M",
    thumbnailUrl: "/test.jpg",
    ...override,
  };
}

function makeCatalogPort(variants: CartVariant[] = []): CartCatalogPort {
  return {
    async getVariantSnapshot(variantId) {
      return variants.find((v) => v.variantId === variantId) ?? null;
    },
  };
}

function makeInventoryPort(stockByVariant: Record<string, number> = {}): CartInventoryPort {
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
// Invariant tests
// ---------------------------------------------------------------------------

describe("isValidQuantity", () => {
  it("accepts integer >= 1", () => {
    expect(isValidQuantity(1)).toBe(true);
    expect(isValidQuantity(99)).toBe(true);
  });

  it("rejects zero, negative, and non-integer", () => {
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(-1)).toBe(false);
    expect(isValidQuantity(1.5)).toBe(false);
  });
});

describe("calculateLineSubtotal", () => {
  it("multiplies quantity by unit price", () => {
    expect(calculateLineSubtotal(3, 50000)).toBe(150000);
    expect(calculateLineSubtotal(0, 50000)).toBe(0);
  });
});

describe("calculateCartTotal", () => {
  it("sums lineSubtotal across items", () => {
    const items = [
      makeCartItem({ id: "i1", lineSubtotal: 100000 }),
      makeCartItem({ id: "i2", lineSubtotal: 50000 }),
    ];
    expect(calculateCartTotal(items)).toBe(150000);
  });

  it("returns 0 for empty cart", () => {
    expect(calculateCartTotal([])).toBe(0);
  });
});

describe("hasDuplicateVariant", () => {
  it("detects duplicate variant in different item", () => {
    const items = [makeCartItem({ id: "i1", variantId: "var-1" })];
    expect(hasDuplicateVariant(items, "var-1")).toBe(true);
  });

  it("ignores the item being excluded", () => {
    const items = [makeCartItem({ id: "i1", variantId: "var-1" })];
    expect(hasDuplicateVariant(items, "var-1", "i1")).toBe(false);
  });

  it("returns false when variant not present", () => {
    const items = [makeCartItem({ id: "i1", variantId: "var-1" })];
    expect(hasDuplicateVariant(items, "var-2")).toBe(false);
  });
});

describe("isValidCartAmount", () => {
  it("accepts zero and positive finite numbers", () => {
    expect(isValidCartAmount(0)).toBe(true);
    expect(isValidCartAmount(150000)).toBe(true);
  });

  it("rejects negative numbers", () => {
    expect(isValidCartAmount(-1)).toBe(false);
  });
});

describe("isCartEditable", () => {
  it("allows ACTIVE", () => expect(isCartEditable("ACTIVE")).toBe(true));
  it("blocks CHECKED_OUT and ABANDONED", () => {
    expect(isCartEditable("CHECKED_OUT")).toBe(false);
    expect(isCartEditable("ABANDONED")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getOrCreateActiveCart / getCartSnapshot
// ---------------------------------------------------------------------------

describe("getOrCreateActiveCart", () => {
  it("returns existing active cart", async () => {
    const repo = new InMemoryCartRepository().seedCarts([makeCart()]);
    const cart = await getOrCreateActiveCart(repo, "customer-1");
    expect(cart.id).toBe("cart-1");
  });

  it("creates a new cart when none exists", async () => {
    const repo = new InMemoryCartRepository();
    const cart = await getOrCreateActiveCart(repo, "customer-new");
    expect(cart.customerId).toBe("customer-new");
    expect(cart.cartStatus).toBe("ACTIVE");
  });
});

describe("getCartSnapshot", () => {
  it("returns empty snapshot for new customer", async () => {
    const repo = new InMemoryCartRepository();
    const snapshot = await getCartSnapshot(repo, "customer-new");
    expect(snapshot.items).toHaveLength(0);
    expect(snapshot.subtotal).toBe(0);
    expect(snapshot.total).toBe(0);
  });

  it("returns items with calculated subtotal and total", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart()])
      .seedItems([makeCartItem({ quantity: 2, unitPriceSnapshot: 100000, lineSubtotal: 200000 })]);
    const snapshot = await getCartSnapshot(repo, "customer-1");
    expect(snapshot.items).toHaveLength(1);
    expect(snapshot.subtotal).toBe(200000);
    expect(snapshot.total).toBe(200000);
  });
});

// ---------------------------------------------------------------------------
// addItemToCart
// ---------------------------------------------------------------------------

describe("addItemToCart", () => {
  it("adds a new item to a new cart", async () => {
    const repo = new InMemoryCartRepository();
    const catalogPort = makeCatalogPort([makeVariant({ variantId: "var-1" })]);
    const inventoryPort = makeInventoryPort({ "var-1": 10 });

    const result = await addItemToCart(repo, catalogPort, inventoryPort, {
      customerId: "customer-1",
      variantId: "var-1",
      quantity: 2,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(2);
      expect(result.data.lineSubtotal).toBe(200000);
    }
  });

  it("merges quantity when variant already in cart", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart()])
      .seedItems([makeCartItem({ quantity: 2, unitPriceSnapshot: 100000, lineSubtotal: 200000 })]);
    const catalogPort = makeCatalogPort([makeVariant({ variantId: "var-1" })]);
    const inventoryPort = makeInventoryPort({ "var-1": 10 });

    const result = await addItemToCart(repo, catalogPort, inventoryPort, {
      customerId: "customer-1",
      variantId: "var-1",
      quantity: 3,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("item-1");
      expect(result.data.quantity).toBe(5);
      expect(result.data.lineSubtotal).toBe(500000);
    }
    const items = await repo.findCartItems("cart-1");
    expect(items).toHaveLength(1);
  });

  it("returns INVALID_QUANTITY for quantity < 1", async () => {
    const repo = new InMemoryCartRepository();
    const result = await addItemToCart(repo, makeCatalogPort(), makeInventoryPort(), {
      customerId: "customer-1",
      variantId: "var-1",
      quantity: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INVALID_QUANTITY");
  });

  it("returns VARIANT_NOT_FOUND when variant does not exist", async () => {
    const repo = new InMemoryCartRepository();
    const result = await addItemToCart(repo, makeCatalogPort([]), makeInventoryPort(), {
      customerId: "customer-1",
      variantId: "var-unknown",
      quantity: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VARIANT_NOT_FOUND");
  });

  it("returns VARIANT_INACTIVE when variant is not active", async () => {
    const repo = new InMemoryCartRepository();
    const catalogPort = makeCatalogPort([makeVariant({ variantId: "var-1", status: "INACTIVE" })]);
    const result = await addItemToCart(repo, catalogPort, makeInventoryPort(), {
      customerId: "customer-1",
      variantId: "var-1",
      quantity: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VARIANT_INACTIVE");
  });

  it("returns INSUFFICIENT_STOCK when stock is not enough", async () => {
    const repo = new InMemoryCartRepository();
    const catalogPort = makeCatalogPort([makeVariant({ variantId: "var-1" })]);
    const inventoryPort = makeInventoryPort({ "var-1": 1 });
    const result = await addItemToCart(repo, catalogPort, inventoryPort, {
      customerId: "customer-1",
      variantId: "var-1",
      quantity: 5,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INSUFFICIENT_STOCK");
  });
});

// ---------------------------------------------------------------------------
// updateCartItemQuantity
// ---------------------------------------------------------------------------

describe("updateCartItemQuantity", () => {
  it("updates quantity and recalculates lineSubtotal", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart()])
      .seedItems([makeCartItem({ quantity: 2, unitPriceSnapshot: 100000, lineSubtotal: 200000 })]);
    const result = await updateCartItemQuantity(repo, makeInventoryPort({ "var-1": 10 }), {
      customerId: "customer-1",
      itemId: "item-1",
      quantity: 4,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(4);
      expect(result.data.lineSubtotal).toBe(400000);
    }
  });

  it("returns ITEM_NOT_FOUND for unknown item", async () => {
    const repo = new InMemoryCartRepository();
    const result = await updateCartItemQuantity(repo, makeInventoryPort(), {
      customerId: "customer-1",
      itemId: "unknown",
      quantity: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ITEM_NOT_FOUND");
  });

  it("returns ITEM_NOT_FOUND when item belongs to a different customer", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart({ customerId: "customer-owner" })])
      .seedItems([makeCartItem()]);
    const result = await updateCartItemQuantity(repo, makeInventoryPort({ "var-1": 10 }), {
      customerId: "customer-intruder",
      itemId: "item-1",
      quantity: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ITEM_NOT_FOUND");
  });

  it("returns INSUFFICIENT_STOCK when new quantity exceeds stock", async () => {
    const repo = new InMemoryCartRepository().seedCarts([makeCart()]).seedItems([makeCartItem()]);
    const result = await updateCartItemQuantity(repo, makeInventoryPort({ "var-1": 1 }), {
      customerId: "customer-1",
      itemId: "item-1",
      quantity: 5,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("INSUFFICIENT_STOCK");
  });
});

// ---------------------------------------------------------------------------
// changeCartItemVariant
// ---------------------------------------------------------------------------

describe("changeCartItemVariant", () => {
  it("changes variant, price snapshot, and recalculates lineSubtotal", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart()])
      .seedItems([makeCartItem({ quantity: 2, unitPriceSnapshot: 100000, lineSubtotal: 200000 })]);
    const catalogPort = makeCatalogPort([makeVariant({ variantId: "var-2", price: 120000 })]);
    const result = await changeCartItemVariant(
      repo,
      catalogPort,
      makeInventoryPort({ "var-2": 10 }),
      {
        customerId: "customer-1",
        itemId: "item-1",
        newVariantId: "var-2",
      },
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.variantId).toBe("var-2");
      expect(result.data.unitPriceSnapshot).toBe(120000);
      expect(result.data.lineSubtotal).toBe(240000);
    }
  });

  it("returns DUPLICATE_VARIANT when target variant already exists in another item", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart()])
      .seedItems([
        makeCartItem({ id: "item-1", variantId: "var-1" }),
        makeCartItem({ id: "item-2", variantId: "var-2" }),
      ]);
    const catalogPort = makeCatalogPort([makeVariant({ variantId: "var-2" })]);
    const result = await changeCartItemVariant(repo, catalogPort, makeInventoryPort(), {
      customerId: "customer-1",
      itemId: "item-1",
      newVariantId: "var-2",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("DUPLICATE_VARIANT");
  });

  it("returns VARIANT_INACTIVE when target variant is inactive", async () => {
    const repo = new InMemoryCartRepository().seedCarts([makeCart()]).seedItems([makeCartItem()]);
    const catalogPort = makeCatalogPort([makeVariant({ variantId: "var-2", status: "INACTIVE" })]);
    const result = await changeCartItemVariant(repo, catalogPort, makeInventoryPort(), {
      customerId: "customer-1",
      itemId: "item-1",
      newVariantId: "var-2",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VARIANT_INACTIVE");
  });

  it("returns ITEM_NOT_FOUND for unknown item", async () => {
    const repo = new InMemoryCartRepository();
    const result = await changeCartItemVariant(repo, makeCatalogPort(), makeInventoryPort(), {
      customerId: "customer-1",
      itemId: "unknown",
      newVariantId: "var-2",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ITEM_NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// removeCartItem
// ---------------------------------------------------------------------------

describe("removeCartItem", () => {
  it("removes an owned item", async () => {
    const repo = new InMemoryCartRepository().seedCarts([makeCart()]).seedItems([makeCartItem()]);
    const result = await removeCartItem(repo, { customerId: "customer-1", itemId: "item-1" });
    expect(result.success).toBe(true);
    const items = await repo.findCartItems("cart-1");
    expect(items).toHaveLength(0);
  });

  it("returns ITEM_NOT_FOUND when item belongs to a different customer", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart({ customerId: "customer-owner" })])
      .seedItems([makeCartItem()]);
    const result = await removeCartItem(repo, {
      customerId: "customer-intruder",
      itemId: "item-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ITEM_NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// clearCart
// ---------------------------------------------------------------------------

describe("clearCart", () => {
  it("removes all items from the active cart", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart()])
      .seedItems([
        makeCartItem({ id: "item-1" }),
        makeCartItem({ id: "item-2", variantId: "var-2" }),
      ]);
    const result = await clearCart(repo, { customerId: "customer-1" });
    expect(result.success).toBe(true);
    const items = await repo.findCartItems("cart-1");
    expect(items).toHaveLength(0);
  });

  it("succeeds even when customer has no cart yet", async () => {
    const repo = new InMemoryCartRepository();
    const result = await clearCart(repo, { customerId: "customer-new" });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getCartCustomerView
// ---------------------------------------------------------------------------

describe("getCartCustomerView", () => {
  it("returns empty customer view for new customer", async () => {
    const repo = new InMemoryCartRepository();
    const view = await getCartCustomerView(repo, makeCatalogPort(), "customer-new");
    expect(view.items).toHaveLength(0);
    expect(view.subtotal).toBe(0);
    expect(view.itemCount).toBe(0);
    expect(view.cartId).toBeTruthy();
  });

  it("enriches items with catalog display fields and sums itemCount", async () => {
    const repo = new InMemoryCartRepository().seedCarts([makeCart()]).seedItems([
      makeCartItem({
        id: "item-1",
        variantId: "var-1",
        quantity: 2,
        unitPriceSnapshot: 150000,
        lineSubtotal: 300000,
      }),
    ]);
    const catalogPort = makeCatalogPort([
      makeVariant({
        variantId: "var-1",
        productName: "Run Socks Pro",
        variantLabel: "S",
        thumbnailUrl: "/socks.jpg",
        price: 150000,
      }),
    ]);

    const view = await getCartCustomerView(repo, catalogPort, "customer-1");

    expect(view.cartId).toBe("cart-1");
    expect(view.subtotal).toBe(300000);
    expect(view.itemCount).toBe(2);
    expect(view.items).toEqual([
      {
        itemId: "item-1",
        variantId: "var-1",
        productName: "Run Socks Pro",
        variantLabel: "S",
        thumbnailUrl: "/socks.jpg",
        unitPrice: 150000,
        quantity: 2,
        lineSubtotal: 300000,
      },
    ]);
  });

  it("uses fallback display fields when catalog variant is missing", async () => {
    const repo = new InMemoryCartRepository()
      .seedCarts([makeCart()])
      .seedItems([makeCartItem({ quantity: 1, unitPriceSnapshot: 100000, lineSubtotal: 100000 })]);

    const view = await getCartCustomerView(repo, makeCatalogPort([]), "customer-1");

    expect(view.items[0]?.productName).toBe("Produk tidak tersedia");
    expect(view.items[0]?.variantLabel).toBe("-");
    expect(view.items[0]?.thumbnailUrl).toBe("");
  });
});
