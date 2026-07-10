import type { CartItem, CartStatus } from "./cart-entities";

// ---------------------------------------------------------------------------
// Cart business invariants
// Sesuai docs/05-domain-modules.md §9 Business Invariants
// ---------------------------------------------------------------------------

/**
 * Quantity item cart minimal 1 dan harus integer.
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1;
}

/**
 * lineSubtotal harus konsisten dengan quantity * unitPrice.
 */
export function calculateLineSubtotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/**
 * Total cart adalah penjumlahan seluruh lineSubtotal item.
 * MVP: belum ada fee/discount di level cart, sehingga subtotal === total.
 * Shipping/tax/diskon dihitung di module checkout.
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.lineSubtotal, 0);
}

/**
 * Satu cart tidak boleh memiliki duplikasi variant pada item terpisah.
 * excludeItemId dipakai saat memvalidasi perubahan variant pada item yang sudah ada.
 */
export function hasDuplicateVariant(
  items: CartItem[],
  variantId: string,
  excludeItemId?: string,
): boolean {
  return items.some((item) => item.variantId === variantId && item.id !== excludeItemId);
}

/**
 * Subtotal dan total cart tidak boleh negatif.
 */
export function isValidCartAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 0;
}

/**
 * Hanya cart dengan status ACTIVE yang boleh diubah (add/remove/update item).
 */
export function isCartEditable(status: CartStatus): boolean {
  return status === "ACTIVE";
}
