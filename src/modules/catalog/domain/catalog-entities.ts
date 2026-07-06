export const CATALOG_PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"] as const;

export type CatalogProductStatus = (typeof CATALOG_PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_TRANSITIONS: Record<CatalogProductStatus, CatalogProductStatus[]> = {
  DRAFT: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["OUT_OF_STOCK", "ARCHIVED"],
  OUT_OF_STOCK: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

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
