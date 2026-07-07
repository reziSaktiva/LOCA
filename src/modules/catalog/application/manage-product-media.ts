import type {
  AddProductMediaCommand,
  ProductMedia,
  ProductSeo,
  UpsertProductSeoCommand,
} from "../domain/catalog-entities";
import { MEDIA_OWNER_TYPES, PRODUCT_MEDIA_TYPES } from "../domain/catalog-entities";
import type { CatalogRepository } from "../domain/catalog-repository";

export type ProductMediaError =
  | { code: "PRODUCT_NOT_FOUND"; message: string }
  | { code: "MEDIA_NOT_FOUND"; message: string }
  | { code: "INVALID_OWNER_TYPE"; message: string }
  | { code: "INVALID_MEDIA_TYPE"; message: string }
  | { code: "URL_REQUIRED"; message: string };

export type ProductMediaResult<T> =
  | { success: true; data: T }
  | { success: false; error: ProductMediaError };

export async function listProductMedia(
  repository: CatalogRepository,
  productId: string,
): Promise<ProductMediaResult<ProductMedia[]>> {
  const product = await repository.findProductById(productId);
  if (!product) {
    return {
      success: false,
      error: { code: "PRODUCT_NOT_FOUND", message: `Product "${productId}" tidak ditemukan.` },
    };
  }

  const media = await repository.listProductMedia("PRODUCT", productId);
  return { success: true, data: media };
}

export async function addProductMedia(
  repository: CatalogRepository,
  command: AddProductMediaCommand,
): Promise<ProductMediaResult<ProductMedia>> {
  if (!MEDIA_OWNER_TYPES.includes(command.ownerType)) {
    return {
      success: false,
      error: {
        code: "INVALID_OWNER_TYPE",
        message: `ownerType "${command.ownerType}" tidak valid. Gunakan: ${MEDIA_OWNER_TYPES.join(", ")}.`,
      },
    };
  }

  if (!PRODUCT_MEDIA_TYPES.includes(command.mediaType)) {
    return {
      success: false,
      error: {
        code: "INVALID_MEDIA_TYPE",
        message: `mediaType "${command.mediaType}" tidak valid. Gunakan: ${PRODUCT_MEDIA_TYPES.join(", ")}.`,
      },
    };
  }

  if (!command.url || command.url.trim().length === 0) {
    return {
      success: false,
      error: { code: "URL_REQUIRED", message: "URL media wajib diisi." },
    };
  }

  // Verifikasi owner exist (jika ownerType PRODUCT)
  if (command.ownerType === "PRODUCT") {
    const product = await repository.findProductById(command.ownerId);
    if (!product) {
      return {
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: `Product "${command.ownerId}" tidak ditemukan.`,
        },
      };
    }

    // Sync thumbnailUrl ke Product jika ini adalah IMAGE pertama / sortOrder 0
    const isFirstImage =
      command.mediaType === "IMAGE" && (command.sortOrder === 0 || command.sortOrder === undefined);
    if (isFirstImage && !product.thumbnailUrl) {
      await repository.updateProduct({ id: command.ownerId, thumbnailUrl: command.url });
    }
  }

  const media = await repository.addProductMedia(command);
  return { success: true, data: media };
}

export async function removeProductMedia(
  repository: CatalogRepository,
  mediaId: string,
): Promise<ProductMediaResult<void>> {
  await repository.removeProductMedia(mediaId);
  return { success: true, data: undefined };
}

export async function getProductSeo(
  repository: CatalogRepository,
  productId: string,
): Promise<ProductMediaResult<ProductSeo | null>> {
  const product = await repository.findProductById(productId);
  if (!product) {
    return {
      success: false,
      error: { code: "PRODUCT_NOT_FOUND", message: `Product "${productId}" tidak ditemukan.` },
    };
  }

  const seo = await repository.getProductSeo(productId);
  return { success: true, data: seo };
}

export async function upsertProductSeo(
  repository: CatalogRepository,
  command: UpsertProductSeoCommand,
): Promise<ProductMediaResult<ProductSeo>> {
  const product = await repository.findProductById(command.productId);
  if (!product) {
    return {
      success: false,
      error: {
        code: "PRODUCT_NOT_FOUND",
        message: `Product "${command.productId}" tidak ditemukan.`,
      },
    };
  }

  const seo = await repository.upsertProductSeo(command);
  return { success: true, data: seo };
}
