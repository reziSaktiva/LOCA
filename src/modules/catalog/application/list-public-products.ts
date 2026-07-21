import { isProductPubliclyListable } from "../domain/catalog-invariants";
import type {
  CatalogRepository,
  ListPublicProductsQuery,
  ListPublicProductsResult,
} from "../domain/catalog-repository";
import { resolveCategoryFilterId } from "./resolve-category-filter";

function sortProducts(
  items: ListPublicProductsResult["items"],
  sort: ListPublicProductsQuery["sort"],
) {
  switch (sort) {
    case "createdAt":
      return items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case "priceFrom":
      return items.sort((a, b) => a.priceFrom - b.priceFrom);
    case "-priceFrom":
      return items.sort((a, b) => b.priceFrom - a.priceFrom);
    case "-createdAt":
    default:
      return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export async function listPublicProducts(
  repository: CatalogRepository,
  query: ListPublicProductsQuery,
): Promise<ListPublicProductsResult> {
  let categoryId: string | undefined;
  if (query.category) {
    const resolved = await resolveCategoryFilterId(repository, query.category);
    if (!resolved) {
      return { items: [], total: 0 };
    }
    categoryId = resolved;
  }

  const allProducts = await repository.listProducts();

  const filtered = allProducts.filter((product) => {
    if (!isProductPubliclyListable(product)) {
      return false;
    }

    if (categoryId && product.categoryId !== categoryId) {
      return false;
    }

    if (query.q && !product.name.toLowerCase().includes(query.q.toLowerCase())) {
      return false;
    }

    if (typeof query.minPrice === "number" && product.priceTo < query.minPrice) {
      return false;
    }

    if (typeof query.maxPrice === "number" && product.priceFrom > query.maxPrice) {
      return false;
    }

    return true;
  });

  const sorted = sortProducts([...filtered], query.sort);
  const start = (query.page - 1) * query.limit;
  const items = sorted.slice(start, start + query.limit);

  return {
    items,
    total: filtered.length,
  };
}
