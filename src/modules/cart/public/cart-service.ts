/**
 * Cart Public Service / Facade
 *
 * Entry point untuk semua consumer lintas module (Checkout, presentation layer).
 * Semua akses ke Cart harus melalui fungsi di file ini.
 */

import { getVariantSnapshotForCart } from "../../catalog/public/catalog-public-service";
import { inventoryAssertStockAvailable } from "../../inventory/public/inventory-service";
import type { CartCatalogPort, CartInventoryPort } from "../application/cart-ports";
import { getCartSnapshot } from "../application/get-cart";
import {
  addItemToCart,
  changeCartItemVariant,
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../application/manage-cart-item";
import type { CartItem, CartResult, CartSnapshot } from "../domain/cart-entities";
import { PrismaCartRepository } from "../infrastructure/prisma-cart-repository";

export type {
  Cart,
  CartError,
  CartItem,
  CartResult,
  CartSnapshot,
  CartStatus,
} from "../domain/cart-entities";

const repository = new PrismaCartRepository();

function makeCatalogPort(): CartCatalogPort {
  return {
    async getVariantSnapshot(variantId) {
      const snapshot = await getVariantSnapshotForCart(variantId);
      if (!snapshot) return null;
      return { variantId: snapshot.variantId, price: snapshot.price, status: snapshot.status };
    },
  };
}

function makeInventoryPort(): CartInventoryPort {
  return {
    async assertStockAvailable(variantId, qty) {
      const result = await inventoryAssertStockAvailable(variantId, qty);
      if (result.success) {
        return { success: true };
      }
      return { success: false, message: result.error.message };
    },
  };
}

/** Mengambil snapshot cart ACTIVE milik customer (membuat cart baru jika belum ada). */
export async function cartGetSnapshot(customerId: string): Promise<CartSnapshot> {
  return getCartSnapshot(repository, customerId);
}

/** Menambah produk ke cart. Menggabungkan quantity jika variant sudah ada di cart. */
export async function cartAddItem(
  customerId: string,
  variantId: string,
  quantity: number,
): Promise<CartResult<CartItem>> {
  return addItemToCart(repository, makeCatalogPort(), makeInventoryPort(), {
    customerId,
    variantId,
    quantity,
  });
}

/** Mengubah quantity item cart. */
export async function cartUpdateItemQuantity(
  customerId: string,
  itemId: string,
  quantity: number,
): Promise<CartResult<CartItem>> {
  return updateCartItemQuantity(repository, makeInventoryPort(), {
    customerId,
    itemId,
    quantity,
  });
}

/** Mengubah variant item cart. */
export async function cartChangeItemVariant(
  customerId: string,
  itemId: string,
  newVariantId: string,
): Promise<CartResult<CartItem>> {
  return changeCartItemVariant(repository, makeCatalogPort(), makeInventoryPort(), {
    customerId,
    itemId,
    newVariantId,
  });
}

/** Menghapus item dari cart. */
export async function cartRemoveItem(
  customerId: string,
  itemId: string,
): Promise<CartResult<void>> {
  return removeCartItem(repository, { customerId, itemId });
}

/** Mengosongkan seluruh item cart milik customer. */
export async function cartClear(customerId: string): Promise<CartResult<void>> {
  return clearCart(repository, { customerId });
}

/**
 * Mengambil snapshot cart untuk consumer lintas module (mis. checkout).
 * Kontrak ini adalah entry point lintas module — jangan ubah shape tanpa menyesuaikan consumer.
 */
export async function getCartSnapshotForCheckout(customerId: string): Promise<CartSnapshot> {
  return getCartSnapshot(repository, customerId);
}
