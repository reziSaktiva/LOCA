import { PRODUCT_STATUS_TRANSITIONS } from "./catalog-entities";
import type { CatalogProduct, CatalogProductStatus } from "./catalog-entities";

export function isProductPubliclyListable(product: CatalogProduct): boolean {
  if (product.status !== "ACTIVE") {
    return false;
  }

  if (product.variantCount < 1) {
    return false;
  }

  if (!product.thumbnailUrl) {
    return false;
  }

  return true;
}

export type ActivationBlockReason = "NO_VARIANT" | "NO_THUMBNAIL";

/**
 * Mengembalikan alasan produk tidak bisa diaktifkan, atau null jika sudah siap.
 * Thumbnail wajib ada saat produk dipublikasikan (PRODUCT-010).
 */
export function getActivationBlockReason(product: CatalogProduct): ActivationBlockReason | null {
  if (product.variantCount < 1) return "NO_VARIANT";
  if (!product.thumbnailUrl) return "NO_THUMBNAIL";
  return null;
}

export function canActivateProduct(product: CatalogProduct): boolean {
  return getActivationBlockReason(product) === null;
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
