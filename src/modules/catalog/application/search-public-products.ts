import type { CatalogProduct } from "../domain/catalog-entities";
import { isProductPubliclyListable } from "../domain/catalog-invariants";
import type { CatalogRepository, ListPublicProductsQuery } from "../domain/catalog-repository";
import { resolveCategoryFilterId } from "./resolve-category-filter";

export type SearchPublicProductsQuery = {
  q: string;
  page: number;
  limit: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ListPublicProductsQuery["sort"];
};

export type SearchPublicProductsResult = {
  items: CatalogProduct[];
  total: number;
};

export type SearchError = { code: "QUERY_EMPTY"; message: string };

export type SearchResult =
  { success: true; result: SearchPublicProductsResult } | { success: false; error: SearchError };

function sortProducts(
  items: CatalogProduct[],
  sort: ListPublicProductsQuery["sort"],
): CatalogProduct[] {
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

/**
 * Full-text search pada katalog publik.
 * Berbeda dari listing: pencarian mencakup name, description, DAN brand.
 * Parameter q wajib diisi — endpoint ini ditujukan untuk use-case search eksplisit user.
 */
export async function searchPublicProducts(
  repository: CatalogRepository,
  query: SearchPublicProductsQuery,
): Promise<SearchResult> {
  if (!query.q || query.q.trim().length === 0) {
    return {
      success: false,
      error: { code: "QUERY_EMPTY", message: "Parameter pencarian (q) tidak boleh kosong." },
    };
  }

  const q = query.q.toLowerCase().trim();

  let categoryId: string | undefined;
  if (query.category) {
    const resolved = await resolveCategoryFilterId(repository, query.category);
    if (!resolved) {
      return { success: true, result: { items: [], total: 0 } };
    }
    categoryId = resolved;
  }

  const allProducts = await repository.listProducts();

  const filtered = allProducts.filter((product) => {
    if (!isProductPubliclyListable(product)) {
      return false;
    }

    const matchesText =
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q);

    if (!matchesText) {
      return false;
    }

    if (categoryId && product.categoryId !== categoryId) {
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
    success: true,
    result: { items, total: filtered.length },
  };
}
