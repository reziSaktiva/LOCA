import type { CatalogVariant, ProductMedia } from "../domain/catalog-entities";
import type { CatalogRepository } from "../domain/catalog-repository";
import { getProductBySlug } from "./get-product-by-slug";

export type ProductDetailInventoryPort = {
  getAvailableQty(variantId: string): Promise<number>;
};

export type PublicProductDetailVariant = {
  id: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  variantLabel: string;
  availableQty: number;
  inStock: boolean;
};

export type PublicProductDetailMedia = {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
  mediaType: ProductMedia["mediaType"];
};

export type PublicProductDetailData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  priceFrom: number;
  priceTo: number;
  thumbnailUrl: string;
  variants: PublicProductDetailVariant[];
  media: PublicProductDetailMedia[];
};

function toPublicVariant(
  variant: CatalogVariant,
  availableQty: number,
): PublicProductDetailVariant {
  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    variantLabel: variant.variantLabel,
    availableQty,
    inStock: availableQty > 0,
  };
}

function toPublicMedia(media: ProductMedia): PublicProductDetailMedia {
  return {
    id: media.id,
    url: media.url,
    altText: media.altText,
    sortOrder: media.sortOrder,
    mediaType: media.mediaType,
  };
}

/**
 * Product detail publik: produk listable + variant ACTIVE + media + stok (via inventory port).
 */
export async function getPublicProductDetail(
  repository: CatalogRepository,
  inventoryPort: ProductDetailInventoryPort,
  slug: string,
): Promise<PublicProductDetailData | null> {
  const result = await getProductBySlug(repository, slug);
  if (!result.found) {
    return null;
  }

  const product = result.product;
  const [variants, mediaResult] = await Promise.all([
    repository.findVariantsByProductId(product.id),
    repository.listProductMedia("PRODUCT", product.id),
  ]);

  const activeVariants = variants.filter((variant) => variant.status === "ACTIVE");
  const variantsWithStock = await Promise.all(
    activeVariants.map(async (variant) => {
      const availableQty = await inventoryPort.getAvailableQty(variant.id);
      return toPublicVariant(variant, availableQty);
    }),
  );

  const media = mediaResult
    .filter((item) => item.mediaType === "IMAGE")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toPublicMedia);

  if (media.length === 0 && product.thumbnailUrl) {
    media.push({
      id: `thumbnail-${product.id}`,
      url: product.thumbnailUrl,
      altText: product.name,
      sortOrder: 0,
      mediaType: "IMAGE",
    });
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    priceFrom: product.priceFrom,
    priceTo: product.priceTo,
    thumbnailUrl: product.thumbnailUrl,
    variants: variantsWithStock,
    media,
  };
}
