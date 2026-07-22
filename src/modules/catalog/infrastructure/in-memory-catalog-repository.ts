import type {
  AddProductMediaCommand,
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CatalogVariant,
  CreateCategoryCommand,
  CreateProductCommand,
  CreateVariantCommand,
  ProductMedia,
  ProductSeo,
  UpdateCategoryCommand,
  UpdateProductCommand,
  UpdateVariantCommand,
  UpsertProductSeoCommand,
  VariantSnapshot,
} from "../domain/catalog-entities";
import type { MediaOwnerType } from "../domain/catalog-entities";
import type { CatalogRepository } from "../domain/catalog-repository";

const categories: CatalogCategory[] = [
  { id: "cat-socks", name: "Socks", slug: "socks", isActive: true },
  { id: "cat-shorts", name: "Shorts", slug: "shorts", isActive: true },
  { id: "cat-boxer", name: "Boxer", slug: "boxer", isActive: true },
  { id: "cat-archived", name: "Legacy", slug: "legacy", isActive: false },
];

const products: CatalogProduct[] = [
  {
    id: "prod-run-socks-pro",
    name: "Run Socks Pro",
    slug: "run-socks-pro",
    description: "Kaos kaki performa tinggi untuk lari dan aktivitas outdoor.",
    brand: "LOCA",
    categoryId: "cat-socks",
    status: "ACTIVE",
    variantCount: 3,
    priceFrom: 89000,
    priceTo: 109000,
    thumbnailUrl: "/catalog/run-socks-pro.jpg",
    createdAt: new Date("2026-07-01T09:00:00.000Z"),
  },
  {
    id: "prod-performance-shorts",
    name: "Performance Shorts",
    slug: "performance-shorts",
    description: "Celana pendek ringan dan breathable untuk gym dan olahraga.",
    brand: "LOCA",
    categoryId: "cat-shorts",
    status: "ACTIVE",
    variantCount: 2,
    priceFrom: 179000,
    priceTo: 219000,
    thumbnailUrl: "/catalog/performance-shorts.jpg",
    createdAt: new Date("2026-07-03T09:00:00.000Z"),
  },
  {
    id: "prod-core-boxer",
    name: "Core Boxer",
    slug: "core-boxer",
    description: "Boxer premium dengan material moisture-wicking.",
    brand: "LOCA",
    categoryId: "cat-boxer",
    status: "DRAFT",
    variantCount: 2,
    priceFrom: 99000,
    priceTo: 119000,
    thumbnailUrl: "/catalog/core-boxer.jpg",
    createdAt: new Date("2026-07-04T09:00:00.000Z"),
  },
  {
    id: "prod-legacy-tee",
    name: "Legacy Tee",
    slug: "legacy-tee",
    description: "Kaos klasik dari koleksi lama.",
    brand: "LOCA",
    categoryId: "cat-archived",
    status: "ARCHIVED",
    variantCount: 1,
    priceFrom: 150000,
    priceTo: 150000,
    thumbnailUrl: "/catalog/legacy-tee.jpg",
    createdAt: new Date("2026-06-20T09:00:00.000Z"),
  },
  {
    id: "prod-invalid-active",
    name: "Invalid Active Product",
    slug: "invalid-active-product",
    description: "Produk aktif tanpa variant — seharusnya tidak tampil publik.",
    brand: "LOCA",
    categoryId: "cat-socks",
    status: "ACTIVE",
    variantCount: 0,
    priceFrom: 50000,
    priceTo: 50000,
    thumbnailUrl: "/catalog/invalid.jpg",
    createdAt: new Date("2026-07-02T09:00:00.000Z"),
  },
];

const variants: CatalogVariant[] = [
  {
    id: "var-run-socks-s",
    productId: "prod-run-socks-pro",
    sku: "LOCA-RSP-S",
    price: 89000,
    compareAtPrice: null,
    variantLabel: "S",
    status: "ACTIVE",
    createdAt: new Date("2026-07-01T09:00:00.000Z"),
  },
  {
    id: "var-run-socks-m",
    productId: "prod-run-socks-pro",
    sku: "LOCA-RSP-M",
    price: 89000,
    compareAtPrice: null,
    variantLabel: "M",
    status: "ACTIVE",
    createdAt: new Date("2026-07-01T09:00:00.000Z"),
  },
  {
    id: "var-run-socks-l",
    productId: "prod-run-socks-pro",
    sku: "LOCA-RSP-L",
    price: 109000,
    compareAtPrice: null,
    variantLabel: "L",
    status: "ACTIVE",
    createdAt: new Date("2026-07-01T09:00:00.000Z"),
  },
  {
    id: "var-perf-shorts-m",
    productId: "prod-performance-shorts",
    sku: "LOCA-PS-M",
    price: 179000,
    compareAtPrice: 219000,
    variantLabel: "M",
    status: "ACTIVE",
    createdAt: new Date("2026-07-03T09:00:00.000Z"),
  },
  {
    id: "var-perf-shorts-l",
    productId: "prod-performance-shorts",
    sku: "LOCA-PS-L",
    price: 219000,
    compareAtPrice: null,
    variantLabel: "L",
    status: "ACTIVE",
    createdAt: new Date("2026-07-03T09:00:00.000Z"),
  },
  {
    id: "var-core-boxer-m",
    productId: "prod-core-boxer",
    sku: "LOCA-CB-M",
    price: 99000,
    compareAtPrice: null,
    variantLabel: "M",
    status: "ACTIVE",
    createdAt: new Date("2026-07-04T09:00:00.000Z"),
  },
  {
    id: "var-core-boxer-l",
    productId: "prod-core-boxer",
    sku: "LOCA-CB-L",
    price: 119000,
    compareAtPrice: null,
    variantLabel: "L",
    status: "ACTIVE",
    createdAt: new Date("2026-07-04T09:00:00.000Z"),
  },
];

let idCounter = 100;
let variantIdCounter = 200;
let categoryIdCounter = 300;
let mediaIdCounter = 400;
let seoIdCounter = 500;

function generateId(): string {
  return `prod-${++idCounter}`;
}

function generateVariantId(): string {
  return `var-${++variantIdCounter}`;
}

function generateCategoryId(): string {
  return `cat-${++categoryIdCounter}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export class InMemoryCatalogRepository implements CatalogRepository {
  private categories: CatalogCategory[] = [...categories];
  private products: CatalogProduct[] = [...products];
  private variants: CatalogVariant[] = [...variants];
  private media: ProductMedia[] = [];
  private seoRecords: ProductSeo[] = [];

  async listCategories(): Promise<CatalogCategory[]> {
    return this.categories;
  }

  async findCategoryById(id: string): Promise<CatalogCategory | null> {
    return this.categories.find((c) => c.id === id) ?? null;
  }

  async existsCategoryWithSlug(slug: string, excludeId?: string): Promise<boolean> {
    return this.categories.some((c) => c.slug === slug && c.id !== excludeId);
  }

  async createCategory(command: CreateCategoryCommand): Promise<CatalogCategory> {
    const category: CatalogCategory = {
      id: generateCategoryId(),
      name: command.name,
      slug: command.slug,
      isActive: true,
    };
    this.categories.push(category);
    return category;
  }

  async updateCategory(command: UpdateCategoryCommand): Promise<CatalogCategory> {
    const index = this.categories.findIndex((c) => c.id === command.id);
    if (index === -1) {
      throw new Error(`Category not found: ${command.id}`);
    }
    const existing = this.categories[index]!;
    const updated: CatalogCategory = {
      ...existing,
      ...(command.name !== undefined && { name: command.name }),
      ...(command.slug !== undefined && { slug: command.slug }),
      ...(command.isActive !== undefined && { isActive: command.isActive }),
    };
    this.categories[index] = updated;
    return updated;
  }

  async listProducts(): Promise<CatalogProduct[]> {
    return this.products;
  }

  async findProductBySlug(slug: string): Promise<CatalogProduct | null> {
    return this.products.find((p) => p.slug === slug) ?? null;
  }

  async findProductById(id: string): Promise<CatalogProduct | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async existsProductWithSlug(slug: string, excludeId?: string): Promise<boolean> {
    return this.products.some((p) => p.slug === slug && p.id !== excludeId);
  }

  async createProduct(command: CreateProductCommand): Promise<CatalogProduct> {
    const product: CatalogProduct = {
      id: generateId(),
      name: command.name,
      slug: command.slug || slugify(command.name),
      description: command.description,
      brand: command.brand,
      categoryId: command.categoryId,
      status: "DRAFT",
      variantCount: 0,
      priceFrom: 0,
      priceTo: 0,
      thumbnailUrl: "",
      createdAt: new Date(),
    };

    this.products.push(product);
    return product;
  }

  async updateProduct(command: UpdateProductCommand): Promise<CatalogProduct> {
    const index = this.products.findIndex((p) => p.id === command.id);
    if (index === -1) {
      throw new Error(`Product not found: ${command.id}`);
    }

    const existing = this.products[index]!;
    const updated: CatalogProduct = {
      ...existing,
      ...(command.name !== undefined && { name: command.name }),
      ...(command.description !== undefined && { description: command.description }),
      ...(command.brand !== undefined && { brand: command.brand }),
      ...(command.categoryId !== undefined && { categoryId: command.categoryId }),
      ...(command.thumbnailUrl !== undefined && { thumbnailUrl: command.thumbnailUrl }),
    };

    this.products[index] = updated;
    return updated;
  }

  async updateProductStatus(id: string, status: CatalogProductStatus): Promise<CatalogProduct> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product not found: ${id}`);
    }

    const updated: CatalogProduct = { ...this.products[index]!, status };
    this.products[index] = updated;
    return updated;
  }

  async findVariantsByProductId(productId: string): Promise<CatalogVariant[]> {
    return this.variants.filter((v) => v.productId === productId);
  }

  async findVariantById(id: string): Promise<CatalogVariant | null> {
    return this.variants.find((v) => v.id === id) ?? null;
  }

  async existsVariantWithSku(sku: string, excludeId?: string): Promise<boolean> {
    return this.variants.some((v) => v.sku === sku && v.id !== excludeId);
  }

  async createVariant(command: CreateVariantCommand): Promise<CatalogVariant> {
    const variant: CatalogVariant = {
      id: generateVariantId(),
      productId: command.productId,
      sku: command.sku,
      price: command.price,
      compareAtPrice: command.compareAtPrice ?? null,
      variantLabel: command.variantLabel,
      status: "ACTIVE",
      createdAt: new Date(),
    };

    this.variants.push(variant);

    const productIndex = this.products.findIndex((p) => p.id === command.productId);
    if (productIndex !== -1) {
      const product = this.products[productIndex]!;
      const allVariants = this.variants.filter((v) => v.productId === command.productId);
      const prices = allVariants.map((v) => v.price);
      this.products[productIndex] = {
        ...product,
        variantCount: allVariants.length,
        priceFrom: Math.min(...prices),
        priceTo: Math.max(...prices),
      };
    }

    return variant;
  }

  async updateVariant(command: UpdateVariantCommand): Promise<CatalogVariant> {
    const index = this.variants.findIndex((v) => v.id === command.id);
    if (index === -1) {
      throw new Error(`Variant not found: ${command.id}`);
    }

    const existing = this.variants[index]!;
    const updated: CatalogVariant = {
      ...existing,
      ...(command.sku !== undefined && { sku: command.sku }),
      ...(command.price !== undefined && { price: command.price }),
      ...(command.compareAtPrice !== undefined && { compareAtPrice: command.compareAtPrice }),
      ...(command.variantLabel !== undefined && { variantLabel: command.variantLabel }),
      ...(command.status !== undefined && { status: command.status }),
    };

    this.variants[index] = updated;

    const productIndex = this.products.findIndex((p) => p.id === updated.productId);
    if (productIndex !== -1) {
      const product = this.products[productIndex]!;
      const allVariants = this.variants.filter((v) => v.productId === updated.productId);
      const prices = allVariants.map((v) => v.price);
      this.products[productIndex] = {
        ...product,
        variantCount: allVariants.length,
        priceFrom: Math.min(...prices),
        priceTo: Math.max(...prices),
      };
    }

    return updated;
  }

  async listProductMedia(ownerType: string, ownerId: string): Promise<ProductMedia[]> {
    return this.media
      .filter((m) => m.ownerType === (ownerType as MediaOwnerType) && m.ownerId === ownerId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async addProductMedia(command: AddProductMediaCommand): Promise<ProductMedia> {
    const mediaItem: ProductMedia = {
      id: `media-${++mediaIdCounter}`,
      ownerType: command.ownerType,
      ownerId: command.ownerId,
      mediaType: command.mediaType,
      url: command.url,
      altText: command.altText ?? "",
      sortOrder: command.sortOrder ?? 0,
      createdAt: new Date(),
    };
    this.media.push(mediaItem);
    return mediaItem;
  }

  async removeProductMedia(mediaId: string): Promise<void> {
    this.media = this.media.filter((m) => m.id !== mediaId);
  }

  async getProductSeo(productId: string): Promise<ProductSeo | null> {
    return this.seoRecords.find((s) => s.productId === productId) ?? null;
  }

  async upsertProductSeo(command: UpsertProductSeoCommand): Promise<ProductSeo> {
    const existingIndex = this.seoRecords.findIndex((s) => s.productId === command.productId);
    if (existingIndex !== -1) {
      const updated: ProductSeo = {
        ...this.seoRecords[existingIndex]!,
        metaTitle: command.metaTitle,
        metaDescription: command.metaDescription,
        canonicalUrl: command.canonicalUrl,
      };
      this.seoRecords[existingIndex] = updated;
      return updated;
    }

    const seo: ProductSeo = {
      id: `seo-${++seoIdCounter}`,
      productId: command.productId,
      metaTitle: command.metaTitle,
      metaDescription: command.metaDescription,
      canonicalUrl: command.canonicalUrl,
    };
    this.seoRecords.push(seo);
    return seo;
  }

  async getVariantSnapshot(variantId: string): Promise<VariantSnapshot | null> {
    const variant = this.variants.find((v) => v.id === variantId);
    if (!variant) {
      return null;
    }

    const product = this.products.find((p) => p.id === variant.productId);
    if (!product) {
      return null;
    }

    const category = this.categories.find((c) => c.id === product.categoryId);

    return {
      variantId: variant.id,
      sku: variant.sku,
      productId: product.id,
      productName: product.name,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      thumbnailUrl: product.thumbnailUrl,
      variantLabel: variant.variantLabel,
      brand: product.brand,
      categoryName: category?.name ?? "",
      status: variant.status,
    };
  }
}
