import {
  getPublicProductDetail,
  type PublicProductDetailData,
} from "../application/get-public-product-detail";
import { listPublicCategories } from "../application/list-public-categories";
import { listPublicProducts } from "../application/list-public-products";
import { searchPublicProducts, type SearchError } from "../application/search-public-products";
import type { VariantSnapshot } from "../domain/catalog-entities";
import type { ListPublicProductsQuery } from "../domain/catalog-repository";
import { PrismaCatalogRepository } from "../infrastructure/prisma-catalog-repository";
import { inventoryGetStock } from "../../inventory/public/inventory-service";

export type PublicProductCard = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  priceFrom: number;
  priceTo: number;
  thumbnailUrl: string;
};

export type PublicProductDetail = PublicProductDetailData;

export type {
  PublicProductDetailVariant,
  PublicProductDetailMedia,
} from "../application/get-public-product-detail";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
};

export type { VariantSnapshot } from "../domain/catalog-entities";

const repository = new PrismaCatalogRepository();
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
  if (
    input === "createdAt" ||
    input === "-createdAt" ||
    input === "priceFrom" ||
    input === "-priceFrom"
  ) {
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

/**
 * Product detail publik lengkap (variants ACTIVE + media + stok).
 * Stok di-enrich via Inventory public facade (dependency Catalog → Inventory).
 */
export async function getPublicProductBySlug(slug: string): Promise<PublicProductDetail | null> {
  return getPublicProductDetail(
    repository,
    {
      async getAvailableQty(variantId) {
        const stock = await inventoryGetStock(variantId);
        return stock?.availableQty ?? 0;
      },
    },
    slug,
  );
}

export type SearchProductsResult =
  | {
      success: true;
      items: PublicProductCard[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }
  | { success: false; error: SearchError };

export async function searchPublicProductsFromSearchParams(
  searchParams: URLSearchParams,
): Promise<SearchProductsResult> {
  const q = searchParams.get("q") ?? "";
  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT), MAX_LIMIT);
  const category = searchParams.get("category") ?? undefined;
  const minPrice = parseOptionalNumber(searchParams.get("minPrice"));
  const maxPrice = parseOptionalNumber(searchParams.get("maxPrice"));
  const sort = parseSort(searchParams.get("sort"));

  const result = await searchPublicProducts(repository, {
    q,
    page,
    limit,
    category,
    minPrice,
    maxPrice,
    sort,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    items: result.result.items.map((product) => ({
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
      total: result.result.total,
      totalPages: Math.ceil(result.result.total / limit),
    },
  };
}

/**
 * Mengambil daftar produk aktif untuk ditampilkan di homepage.
 * Kontrak ini adalah entry point lintas module untuk consumer `homepage`.
 */
export async function listActiveProductsForHomepage(limit: number): Promise<PublicProductCard[]> {
  const result = await listPublicProducts(repository, {
    page: 1,
    limit,
    sort: "-createdAt",
  });

  return result.items.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    priceFrom: product.priceFrom,
    priceTo: product.priceTo,
    thumbnailUrl: product.thumbnailUrl,
  }));
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
