import type { CatalogRepository } from "../domain/catalog-repository";

/**
 * Resolves API `category` query (slug per docs/07, atau id untuk kompatibilitas) ke categoryId.
 * Return `null` jika param ada tapi kategori tidak ditemukan.
 */
export async function resolveCategoryFilterId(
  repository: CatalogRepository,
  categoryParam: string,
): Promise<string | null> {
  const byId = await repository.findCategoryById(categoryParam);
  if (byId) {
    return byId.id;
  }

  const categories = await repository.listCategories();
  const bySlug = categories.find((category) => category.slug === categoryParam);
  return bySlug?.id ?? null;
}
