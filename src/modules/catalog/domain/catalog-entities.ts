export const MEDIA_OWNER_TYPES = ["PRODUCT", "VARIANT"] as const;
export type MediaOwnerType = (typeof MEDIA_OWNER_TYPES)[number];

export const PRODUCT_MEDIA_TYPES = ["IMAGE", "VIDEO", "THREE_SIXTY", "MANUAL_PDF"] as const;
export type ProductMediaType = (typeof PRODUCT_MEDIA_TYPES)[number];

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
  brand: string;
  categoryName: string;
  status: CatalogVariantStatus;
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

export type ProductMedia = {
  id: string;
  ownerType: MediaOwnerType;
  ownerId: string;
  mediaType: ProductMediaType;
  url: string;
  altText: string;
  sortOrder: number;
  createdAt: Date;
};

export type ProductSeo = {
  id: string;
  productId: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
};

export type AddProductMediaCommand = {
  ownerType: MediaOwnerType;
  ownerId: string;
  mediaType: ProductMediaType;
  url: string;
  altText?: string;
  sortOrder?: number;
};

export type UpsertProductSeoCommand = {
  productId: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
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
