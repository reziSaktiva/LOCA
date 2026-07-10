import type {
  AddItemToCartCommand,
  CartItem,
  CartResult,
  ChangeCartItemVariantCommand,
  ClearCartCommand,
  RemoveCartItemCommand,
  UpdateCartItemQuantityCommand,
} from "../domain/cart-entities";
import { calculateLineSubtotal, isValidQuantity } from "../domain/cart-invariants";
import type { CartRepository } from "../domain/cart-repository";
import type { CartCatalogPort, CartInventoryPort } from "./cart-ports";
import { getOrCreateActiveCart } from "./get-cart";

/**
 * Menemukan item milik customer dan memverifikasi ownership melalui cart-nya.
 * Mengembalikan null jika item tidak ditemukan atau bukan milik customer
 * (disamakan sebagai ITEM_NOT_FOUND agar tidak membocorkan keberadaan item milik orang lain).
 */
async function findOwnedItem(
  repository: CartRepository,
  customerId: string,
  itemId: string,
): Promise<CartItem | null> {
  const item = await repository.findCartItemById(itemId);
  if (!item) {
    return null;
  }

  const cart = await repository.findCartById(item.cartId);
  if (!cart || cart.customerId !== customerId) {
    return null;
  }

  return item;
}

/**
 * Menambah produk ke cart (CART-001).
 * Jika variant yang sama sudah ada di cart, quantity ditambahkan ke item yang sudah ada
 * (menjaga invariant: satu cart tidak boleh memiliki duplikasi variant pada item terpisah).
 */
export async function addItemToCart(
  repository: CartRepository,
  catalogPort: CartCatalogPort,
  inventoryPort: CartInventoryPort,
  command: AddItemToCartCommand,
): Promise<CartResult<CartItem>> {
  if (!isValidQuantity(command.quantity)) {
    return {
      success: false,
      error: { code: "INVALID_QUANTITY", message: "Quantity minimal 1." },
    };
  }

  const variant = await catalogPort.getVariantSnapshot(command.variantId);
  if (!variant) {
    return {
      success: false,
      error: { code: "VARIANT_NOT_FOUND", message: "Varian tidak ditemukan." },
    };
  }

  if (variant.status !== "ACTIVE") {
    return {
      success: false,
      error: { code: "VARIANT_INACTIVE", message: "Varian tidak aktif dan tidak dapat dibeli." },
    };
  }

  const cart = await getOrCreateActiveCart(repository, command.customerId);
  const existingItem = await repository.findCartItemByVariantId(cart.id, command.variantId);
  const targetQuantity = existingItem ? existingItem.quantity + command.quantity : command.quantity;

  const stockCheck = await inventoryPort.assertStockAvailable(command.variantId, targetQuantity);
  if (!stockCheck.success) {
    return {
      success: false,
      error: { code: "INSUFFICIENT_STOCK", message: stockCheck.message },
    };
  }

  const lineSubtotal = calculateLineSubtotal(targetQuantity, variant.price);

  if (existingItem) {
    const mergeSubtotal = calculateLineSubtotal(targetQuantity, existingItem.unitPriceSnapshot);
    const updated = await repository.updateItemQuantity({
      itemId: existingItem.id,
      quantity: targetQuantity,
      lineSubtotal: mergeSubtotal,
    });
    return { success: true, data: updated };
  }

  const created = await repository.addItem({
    cartId: cart.id,
    variantId: command.variantId,
    quantity: targetQuantity,
    unitPriceSnapshot: variant.price,
    lineSubtotal,
  });
  return { success: true, data: created };
}

/**
 * Mengubah quantity item cart (CART-003).
 */
export async function updateCartItemQuantity(
  repository: CartRepository,
  inventoryPort: CartInventoryPort,
  command: UpdateCartItemQuantityCommand,
): Promise<CartResult<CartItem>> {
  if (!isValidQuantity(command.quantity)) {
    return {
      success: false,
      error: { code: "INVALID_QUANTITY", message: "Quantity minimal 1." },
    };
  }

  const item = await findOwnedItem(repository, command.customerId, command.itemId);
  if (!item) {
    return {
      success: false,
      error: { code: "ITEM_NOT_FOUND", message: "Item cart tidak ditemukan." },
    };
  }

  const stockCheck = await inventoryPort.assertStockAvailable(item.variantId, command.quantity);
  if (!stockCheck.success) {
    return {
      success: false,
      error: { code: "INSUFFICIENT_STOCK", message: stockCheck.message },
    };
  }

  const lineSubtotal = calculateLineSubtotal(command.quantity, item.unitPriceSnapshot);
  const updated = await repository.updateItemQuantity({
    itemId: item.id,
    quantity: command.quantity,
    lineSubtotal,
  });
  return { success: true, data: updated };
}

/**
 * Mengubah variant item cart (CART-004).
 * Variant tujuan wajib aktif, tersedia stoknya, dan belum dipakai item lain di cart yang sama.
 */
export async function changeCartItemVariant(
  repository: CartRepository,
  catalogPort: CartCatalogPort,
  inventoryPort: CartInventoryPort,
  command: ChangeCartItemVariantCommand,
): Promise<CartResult<CartItem>> {
  const item = await findOwnedItem(repository, command.customerId, command.itemId);
  if (!item) {
    return {
      success: false,
      error: { code: "ITEM_NOT_FOUND", message: "Item cart tidak ditemukan." },
    };
  }

  const duplicate = await repository.findCartItemByVariantId(item.cartId, command.newVariantId);
  if (duplicate && duplicate.id !== item.id) {
    return {
      success: false,
      error: { code: "DUPLICATE_VARIANT", message: "Varian tersebut sudah ada di cart." },
    };
  }

  const variant = await catalogPort.getVariantSnapshot(command.newVariantId);
  if (!variant) {
    return {
      success: false,
      error: { code: "VARIANT_NOT_FOUND", message: "Varian tidak ditemukan." },
    };
  }

  if (variant.status !== "ACTIVE") {
    return {
      success: false,
      error: { code: "VARIANT_INACTIVE", message: "Varian tidak aktif dan tidak dapat dibeli." },
    };
  }

  const stockCheck = await inventoryPort.assertStockAvailable(command.newVariantId, item.quantity);
  if (!stockCheck.success) {
    return {
      success: false,
      error: { code: "INSUFFICIENT_STOCK", message: stockCheck.message },
    };
  }

  const lineSubtotal = calculateLineSubtotal(item.quantity, variant.price);
  const updated = await repository.updateItemVariant({
    itemId: item.id,
    variantId: command.newVariantId,
    unitPriceSnapshot: variant.price,
    lineSubtotal,
  });
  return { success: true, data: updated };
}

/**
 * Menghapus item dari cart (CART-002).
 */
export async function removeCartItem(
  repository: CartRepository,
  command: RemoveCartItemCommand,
): Promise<CartResult<void>> {
  const item = await findOwnedItem(repository, command.customerId, command.itemId);
  if (!item) {
    return {
      success: false,
      error: { code: "ITEM_NOT_FOUND", message: "Item cart tidak ditemukan." },
    };
  }

  await repository.removeItem(item.id);
  return { success: true, data: undefined };
}

/**
 * Mengosongkan seluruh item cart milik customer. Idempotent — sukses meski cart belum ada.
 */
export async function clearCart(
  repository: CartRepository,
  command: ClearCartCommand,
): Promise<CartResult<void>> {
  const cart = await repository.findActiveCartByCustomerId(command.customerId);
  if (!cart) {
    return { success: true, data: undefined };
  }

  await repository.clearItems(cart.id);
  return { success: true, data: undefined };
}
