import { calculateCartTotal } from "../domain/cart-invariants";
import type { Cart, CartSnapshot } from "../domain/cart-entities";
import type { CartRepository } from "../domain/cart-repository";

const DEFAULT_CART_CURRENCY = "IDR";

/**
 * Mengambil cart ACTIVE milik customer, atau membuat cart baru (kosong) jika belum ada.
 * Sesuai public service `getActiveCart(actorContext)` di docs/05-domain-modules.md §9.
 */
export async function getOrCreateActiveCart(
  repository: CartRepository,
  customerId: string,
): Promise<Cart> {
  const existing = await repository.findActiveCartByCustomerId(customerId);
  if (existing) {
    return existing;
  }

  return repository.createCart(customerId, DEFAULT_CART_CURRENCY);
}

/**
 * Mengambil snapshot cart (cart + items + subtotal + total) milik customer.
 * Membuat cart baru (kosong) jika customer belum pernah memiliki cart ACTIVE.
 */
export async function getCartSnapshot(
  repository: CartRepository,
  customerId: string,
): Promise<CartSnapshot> {
  const cart = await getOrCreateActiveCart(repository, customerId);
  const items = await repository.findCartItems(cart.id);
  const total = calculateCartTotal(items);

  return { cart, items, subtotal: total, total };
}
