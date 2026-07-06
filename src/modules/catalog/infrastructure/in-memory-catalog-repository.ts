import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductStatus,
  CreateProductCommand,
  UpdateProductCommand,
} from "../domain/catalog-entities";
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

let idCounter = 100;

function generateId(): string {
  return `prod-${++idCounter}`;
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

  async listCategories(): Promise<CatalogCategory[]> {
    return this.categories;
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
}
