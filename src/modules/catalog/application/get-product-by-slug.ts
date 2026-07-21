import type { CatalogProduct } from "../domain/catalog-entities";
import { isProductPubliclyListable } from "../domain/catalog-invariants";
import type { CatalogRepository } from "../domain/catalog-repository";

export type GetProductBySlugResult = { found: true; product: CatalogProduct } | { found: false };

export async function getProductBySlug(
  repository: CatalogRepository,
  slug: string,
): Promise<GetProductBySlugResult> {
  const product = await repository.findProductBySlug(slug);

  if (!product) {
    return { found: false };
  }

  if (!isProductPubliclyListable(product)) {
    return { found: false };
  }

  return { found: true, product };
}
