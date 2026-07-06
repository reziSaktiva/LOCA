import { PRODUCT_STATUS_TRANSITIONS } from "./catalog-entities";
import type { CatalogProduct, CatalogProductStatus } from "./catalog-entities";

export function isProductPubliclyListable(product: CatalogProduct): boolean {
  if (product.status !== "ACTIVE") {
    return false;
  }

  if (product.variantCount < 1) {
    return false;
  }

  return true;
}

export function canActivateProduct(product: CatalogProduct): boolean {
  return product.variantCount >= 1;
}

export function isAllowedStatusTransition(
  from: CatalogProductStatus,
  to: CatalogProductStatus,
): boolean {
  return PRODUCT_STATUS_TRANSITIONS[from].includes(to);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

/**
 * Harga variant harus berupa angka finite dan tidak boleh negatif.
 * Berlaku untuk price maupun compareAtPrice.
 */
export function isVariantPriceValid(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}

/**
 * SKU wajib non-empty setelah di-trim.
 * Format bebas (huruf, angka, tanda hubung, underscore) — uniqueness dijaga di repository.
 */
export function isValidSku(sku: string): boolean {
  return sku.trim().length > 0;
}
