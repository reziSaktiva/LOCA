import type { CatalogProduct } from "./catalog-entities";

export function isProductPubliclyListable(product: CatalogProduct): boolean {
  if (product.status !== "ACTIVE") {
    return false;
  }

  if (product.variantCount < 1) {
    return false;
  }

  return true;
}
