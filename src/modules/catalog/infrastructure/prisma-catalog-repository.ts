import { prisma } from "../../../shared/infrastructure/database/client";
import type {
  AddProductMediaCommand,
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CatalogVariant,
  CatalogVariantStatus,
  CreateCategoryCommand,
  CreateProductCommand,
  CreateVariantCommand,
  ProductMedia,
  ProductMediaType,
  ProductSeo,
  UpdateCategoryCommand,
  UpdateProductCommand,
  UpdateVariantCommand,
  UpsertProductSeoCommand,
  VariantSnapshot,
} from "../domain/catalog-entities";
import type { MediaOwnerType } from "../domain/catalog-entities";
import type { CatalogRepository } from "../domain/catalog-repository";

// ---- Mappers ----------------------------------------------------------------

function toCategory(row: {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}): CatalogCategory {
  return { id: row.id, name: row.name, slug: row.slug, isActive: row.isActive };
}

function toProduct(row: {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  status: string;
  variantCount: number;
  priceFrom: number;
  priceTo: number;
  thumbnailUrl: string;
  createdAt: Date;
}): CatalogProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    brand: row.brand,
    categoryId: row.categoryId,
    status: row.status as CatalogProductStatus,
    variantCount: row.variantCount,
    priceFrom: row.priceFrom,
    priceTo: row.priceTo,
    thumbnailUrl: row.thumbnailUrl,
    createdAt: row.createdAt,
  };
}

function toVariant(row: {
  id: string;
  productId: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  variantLabel: string;
  status: string;
  createdAt: Date;
}): CatalogVariant {
  return {
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    variantLabel: row.variantLabel,
    status: row.status as CatalogVariantStatus,
    createdAt: row.createdAt,
  };
}

function toMedia(row: {
  id: string;
  ownerType: string;
  ownerId: string;
  mediaType: string;
  url: string;
  altText: string;
  sortOrder: number;
  createdAt: Date;
}): ProductMedia {
  return {
    id: row.id,
    ownerType: row.ownerType as MediaOwnerType,
    ownerId: row.ownerId,
    mediaType: row.mediaType as ProductMediaType,
    url: row.url,
    altText: row.altText,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  };
}

function toSeo(row: {
  id: string;
  productId: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
}): ProductSeo {
  return {
    id: row.id,
    productId: row.productId,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
  };
}

// ---- Repository -------------------------------------------------------------

export class PrismaCatalogRepository implements CatalogRepository {
  // --- Category ---

  async listCategories(): Promise<CatalogCategory[]> {
    const rows = await prisma.productCategory.findMany({
      where: { isDeleted: false },
      orderBy: { name: "asc" },
    });
    return rows.map(toCategory);
  }

  async findCategoryById(id: string): Promise<CatalogCategory | null> {
    const row = await prisma.productCategory.findFirst({
      where: { id, isDeleted: false },
    });
    return row ? toCategory(row) : null;
  }

  async existsCategoryWithSlug(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.productCategory.count({
      where: {
        slug,
        isDeleted: false,
        ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async createCategory(command: CreateCategoryCommand): Promise<CatalogCategory> {
    const row = await prisma.productCategory.create({
      data: {
        name: command.name,
        slug: command.slug,
        isActive: true,
      },
    });
    return toCategory(row);
  }

  async updateCategory(command: UpdateCategoryCommand): Promise<CatalogCategory> {
    const row = await prisma.productCategory.update({
      where: { id: command.id },
      data: {
        ...(command.name !== undefined && { name: command.name }),
        ...(command.slug !== undefined && { slug: command.slug }),
        ...(command.isActive !== undefined && { isActive: command.isActive }),
      },
    });
    return toCategory(row);
  }

  // --- Product ---

  async listProducts(): Promise<CatalogProduct[]> {
    const rows = await prisma.product.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toProduct);
  }

  async findProductBySlug(slug: string): Promise<CatalogProduct | null> {
    const row = await prisma.product.findFirst({
      where: { slug, isDeleted: false },
    });
    return row ? toProduct(row) : null;
  }

  async findProductById(id: string): Promise<CatalogProduct | null> {
    const row = await prisma.product.findFirst({
      where: { id, isDeleted: false },
    });
    return row ? toProduct(row) : null;
  }

  async existsProductWithSlug(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: {
        slug,
        isDeleted: false,
        ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async createProduct(command: CreateProductCommand): Promise<CatalogProduct> {
    const row = await prisma.product.create({
      data: {
        name: command.name,
        slug: command.slug,
        description: command.description,
        brand: command.brand,
        categoryId: command.categoryId,
        status: "DRAFT",
      },
    });
    return toProduct(row);
  }

  async updateProduct(command: UpdateProductCommand): Promise<CatalogProduct> {
    const row = await prisma.product.update({
      where: { id: command.id },
      data: {
        ...(command.name !== undefined && { name: command.name }),
        ...(command.description !== undefined && { description: command.description }),
        ...(command.brand !== undefined && { brand: command.brand }),
        ...(command.categoryId !== undefined && { categoryId: command.categoryId }),
        ...(command.thumbnailUrl !== undefined && { thumbnailUrl: command.thumbnailUrl }),
      },
    });
    return toProduct(row);
  }

  async updateProductStatus(id: string, status: CatalogProductStatus): Promise<CatalogProduct> {
    const row = await prisma.product.update({
      where: { id },
      data: { status },
    });
    return toProduct(row);
  }

  // --- Variant ---

  async findVariantsByProductId(productId: string): Promise<CatalogVariant[]> {
    const rows = await prisma.productVariant.findMany({
      where: { productId, isDeleted: false },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toVariant);
  }

  async findVariantById(id: string): Promise<CatalogVariant | null> {
    const row = await prisma.productVariant.findFirst({
      where: { id, isDeleted: false },
    });
    return row ? toVariant(row) : null;
  }

  async existsVariantWithSku(sku: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.productVariant.count({
      where: {
        sku,
        isDeleted: false,
        ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async createVariant(command: CreateVariantCommand): Promise<CatalogVariant> {
    const created = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId: command.productId,
          sku: command.sku,
          price: command.price,
          compareAtPrice: command.compareAtPrice ?? null,
          variantLabel: command.variantLabel,
          status: "ACTIVE",
        },
      });

      await this.syncProductDenormalizedFields(tx, command.productId);

      return variant;
    });

    return toVariant(created);
  }

  async updateVariant(command: UpdateVariantCommand): Promise<CatalogVariant> {
    const updated = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id: command.id },
        data: {
          ...(command.sku !== undefined && { sku: command.sku }),
          ...(command.price !== undefined && { price: command.price }),
          ...(command.compareAtPrice !== undefined && { compareAtPrice: command.compareAtPrice }),
          ...(command.variantLabel !== undefined && { variantLabel: command.variantLabel }),
          ...(command.status !== undefined && { status: command.status }),
        },
      });

      await this.syncProductDenormalizedFields(tx, variant.productId);

      return variant;
    });

    return toVariant(updated);
  }

  async getVariantSnapshot(variantId: string): Promise<VariantSnapshot | null> {
    const row = await prisma.productVariant.findFirst({
      where: { id: variantId, isDeleted: false },
      include: {
        product: {
          select: { id: true, name: true, thumbnailUrl: true },
        },
      },
    });

    if (!row) return null;

    return {
      variantId: row.id,
      sku: row.sku,
      productId: row.product.id,
      productName: row.product.name,
      price: row.price,
      compareAtPrice: row.compareAtPrice,
      thumbnailUrl: row.product.thumbnailUrl,
      variantLabel: row.variantLabel,
    };
  }

  // --- Media ---

  async listProductMedia(ownerType: string, ownerId: string): Promise<ProductMedia[]> {
    const rows = await prisma.productMedia.findMany({
      where: { ownerType: ownerType as MediaOwnerType, ownerId },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(toMedia);
  }

  async addProductMedia(command: AddProductMediaCommand): Promise<ProductMedia> {
    const row = await prisma.productMedia.create({
      data: {
        ownerType: command.ownerType,
        ownerId: command.ownerId,
        mediaType: command.mediaType,
        url: command.url,
        altText: command.altText ?? "",
        sortOrder: command.sortOrder ?? 0,
      },
    });
    return toMedia(row);
  }

  async removeProductMedia(mediaId: string): Promise<void> {
    await prisma.productMedia.delete({ where: { id: mediaId } });
  }

  // --- SEO ---

  async getProductSeo(productId: string): Promise<ProductSeo | null> {
    const row = await prisma.productSeo.findUnique({ where: { productId } });
    return row ? toSeo(row) : null;
  }

  async upsertProductSeo(command: UpsertProductSeoCommand): Promise<ProductSeo> {
    const row = await prisma.productSeo.upsert({
      where: { productId: command.productId },
      create: {
        productId: command.productId,
        metaTitle: command.metaTitle,
        metaDescription: command.metaDescription,
        canonicalUrl: command.canonicalUrl,
      },
      update: {
        metaTitle: command.metaTitle,
        metaDescription: command.metaDescription,
        canonicalUrl: command.canonicalUrl,
      },
    });
    return toSeo(row);
  }

  // ---- Private helpers -------------------------------------------------------

  /**
   * Menyinkronkan field denormalisasi pada produk (variantCount, priceFrom, priceTo)
   * setelah mutasi varian. Dipanggil di dalam transaksi yang sama agar konsisten.
   */
  private async syncProductDenormalizedFields(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    productId: string,
  ): Promise<void> {
    const activeVariants = await tx.productVariant.findMany({
      where: { productId, isDeleted: false },
      select: { price: true },
    });

    const prices = activeVariants.map((v) => v.price);
    const count = prices.length;

    await tx.product.update({
      where: { id: productId },
      data: {
        variantCount: count,
        priceFrom: count > 0 ? Math.min(...prices) : 0,
        priceTo: count > 0 ? Math.max(...prices) : 0,
      },
    });
  }
}
