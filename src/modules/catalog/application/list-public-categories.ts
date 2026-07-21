import { isProductPubliclyListable } from "../domain/catalog-invariants";
import type { CatalogRepository } from "../domain/catalog-repository";

export async function listPublicCategories(repository: CatalogRepository) {
  const [categories, products] = await Promise.all([
    repository.listCategories(),
    repository.listProducts(),
  ]);

  const activeCategoryIds = new Set(
    products
      .filter((product) => isProductPubliclyListable(product))
      .map((product) => product.categoryId),
  );

  return categories.filter((category) => category.isActive && activeCategoryIds.has(category.id));
}
