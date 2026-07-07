export const CATALOG_PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"] as const;

export type CatalogProductStatus = (typeof CATALOG_PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_TRANSITIONS: Record<CatalogProductStatus, CatalogProductStatus[]> = {
  DRAFT: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["OUT_OF_STOCK", "ARCHIVED"],
  OUT_OF_STOCK: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export const CATALOG_VARIANT_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type CatalogVariantStatus = (typeof CATALOG_VARIANT_STATUSES)[number];

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  status: CatalogProductStatus;
  variantCount: number;
  priceFrom: number;
  priceTo: number;
  thumbnailUrl: string;
  createdAt: Date;
};

export type CatalogVariant = {
  id: string;
  productId: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  variantLabel: string;
  status: CatalogVariantStatus;
  createdAt: Date;
};

/**
 * Snapshot immutable yang dikirim ke consumer lain (mis. cart) saat membaca data varian.
 * Tidak berubah saat katalog diupdate — consumer bertanggung jawab menyimpan copy-nya sendiri.
 */
export type VariantSnapshot = {
  variantId: string;
  sku: string;
  productId: string;
  productName: string;
  price: number;
  compareAtPrice: number | null;
  thumbnailUrl: string;
  variantLabel: string;
};

export type CreateProductCommand = {
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
};

export type UpdateProductCommand = {
  id: string;
  name?: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  thumbnailUrl?: string;
};

export type CreateVariantCommand = {
  productId: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  variantLabel: string;
};

export type UpdateVariantCommand = {
  id: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number | null;
  variantLabel?: string;
  status?: CatalogVariantStatus;
};

export type CreateCategoryCommand = {
  name: string;
  slug: string;
};

export type UpdateCategoryCommand = {
  id: string;
  name?: string;
  slug?: string;
  isActive?: boolean;
};
