import { getProductBySlug } from "../application/get-product-by-slug";
import { listPublicCategories } from "../application/list-public-categories";
import { listPublicProducts } from "../application/list-public-products";
import type { VariantSnapshot } from "../domain/catalog-entities";
import type { ListPublicProductsQuery } from "../domain/catalog-repository";
import { InMemoryCatalogRepository } from "../infrastructure/in-memory-catalog-repository";

export type PublicProductCard = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  priceFrom: number;
  priceTo: number;
  thumbnailUrl: string;
};

export type PublicProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  priceFrom: number;
  priceTo: number;
  thumbnailUrl: string;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
};

const repository = new InMemoryCatalogRepository();
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

function parsePositiveInt(input: string | null, fallback: number): number {
  if (!input) {
    return fallback;
  }

  const value = Number(input);
  if (!Number.isInteger(value) || value < 1) {
    return fallback;
  }

  return value;
}

function parseOptionalNumber(input: string | null): number | undefined {
  if (!input) {
    return undefined;
  }

  const value = Number(input);
  if (!Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return value;
}

function parseSort(input: string | null): ListPublicProductsQuery["sort"] {
  if (input === "createdAt" || input === "-createdAt" || input === "priceFrom" || input === "-priceFrom") {
    return input;
  }

  return "-createdAt";
}

export async function listPublicProductsFromSearchParams(searchParams: URLSearchParams) {
  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const minPrice = parseOptionalNumber(searchParams.get("minPrice"));
  const maxPrice = parseOptionalNumber(searchParams.get("maxPrice"));
  const sort = parseSort(searchParams.get("sort"));

  const result = await listPublicProducts(repository, {
    page,
    limit,
    category,
    q,
    minPrice,
    maxPrice,
    sort,
  });

  return {
    items: result.items.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      priceFrom: product.priceFrom,
      priceTo: product.priceTo,
      thumbnailUrl: product.thumbnailUrl,
    })) as PublicProductCard[],
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}

export async function listPublicCategoriesForCatalog(): Promise<PublicCategory[]> {
  const result = await listPublicCategories(repository);
  return result.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  }));
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<PublicProductDetail | null> {
  const result = await getProductBySlug(repository, slug);

  if (!result.found) {
    return null;
  }

  return {
    id: result.product.id,
    name: result.product.name,
    slug: result.product.slug,
    description: result.product.description,
    brand: result.product.brand,
    categoryId: result.product.categoryId,
    priceFrom: result.product.priceFrom,
    priceTo: result.product.priceTo,
    thumbnailUrl: result.product.thumbnailUrl,
  };
}

/**
 * Mengambil snapshot varian untuk digunakan oleh consumer module lain (mis. cart).
 * Kontrak ini adalah entry point lintas module — jangan ubah shape tanpa menyesuaikan consumer.
 */
export async function getVariantSnapshotForCart(
  variantId: string,
): Promise<VariantSnapshot | null> {
  return repository.getVariantSnapshot(variantId);
}
