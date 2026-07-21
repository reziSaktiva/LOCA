import type { CartRepository } from "../domain/cart-repository";
import type { CartCatalogPort } from "./cart-ports";
import { getCartSnapshot } from "./get-cart";

export type CartCustomerItemView = {
  itemId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  thumbnailUrl: string;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
};

/**
 * Customer-facing cart DTO for REST API (`docs/07-api-specification.md` §Cart).
 * Shape matches acceptance criteria di planning/backlog.md M6.4.
 */
export type CartCustomerView = {
  cartId: string;
  items: CartCustomerItemView[];
  subtotal: number;
  itemCount: number;
};

const FALLBACK_PRODUCT_NAME = "Produk tidak tersedia";
const FALLBACK_VARIANT_LABEL = "-";
const FALLBACK_THUMBNAIL = "";

/**
 * Mengambil cart ACTIVE milik customer (auto-create jika belum ada) dan
 * memperkaya setiap item dengan display fields dari Catalog via port.
 */
export async function getCartCustomerView(
  repository: CartRepository,
  catalogPort: CartCatalogPort,
  customerId: string,
): Promise<CartCustomerView> {
  const snapshot = await getCartSnapshot(repository, customerId);

  const items: CartCustomerItemView[] = await Promise.all(
    snapshot.items.map(async (item) => {
      const variant = await catalogPort.getVariantSnapshot(item.variantId);
      return {
        itemId: item.id,
        variantId: item.variantId,
        productName: variant?.productName ?? FALLBACK_PRODUCT_NAME,
        variantLabel: variant?.variantLabel ?? FALLBACK_VARIANT_LABEL,
        thumbnailUrl: variant?.thumbnailUrl ?? FALLBACK_THUMBNAIL,
        unitPrice: item.unitPriceSnapshot,
        quantity: item.quantity,
        lineSubtotal: item.lineSubtotal,
      };
    }),
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartId: snapshot.cart.id,
    items,
    subtotal: snapshot.subtotal,
    itemCount,
  };
}
