import {
  CatalogPagination,
  ProductFilters,
  ProductGrid,
} from "@/modules/catalog/presentation";
import {
  listPublicCategoriesForCatalog,
  listPublicProductsFromSearchParams,
} from "@/modules/catalog/public/catalog-public-service";
import { Container } from "@/shared/ui/container";

export const metadata = {
  title: "Katalog — LOCA",
  description: "Jelajahi koleksi sports apparel essentials LOCA.",
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function toUrlSearchParams(record: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const resolved = firstParam(value);
    if (resolved !== undefined && resolved !== "") {
      params.set(key, resolved);
    }
  }
  return params;
}

function buildQueryBase(params: URLSearchParams): string {
  const next = new URLSearchParams(params);
  next.delete("page");
  return next.toString();
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const urlParams = toUrlSearchParams(resolvedParams);

  const [listing, categories] = await Promise.all([
    listPublicProductsFromSearchParams(urlParams),
    listPublicCategoriesForCatalog(),
  ]);

  const activeCategory = firstParam(resolvedParams.category);
  const categoryName = categories.find((category) => category.slug === activeCategory)?.name;
  const heading = categoryName ? categoryName : "Katalog";

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          {heading}
        </h1>
        <p className="text-sm text-muted-foreground">
          {listing.pagination.total > 0
            ? `${listing.pagination.total} produk`
            : "Belum ada produk yang cocok dengan filter ini."}
        </p>
      </header>

      <ProductFilters
        categories={categories}
        values={{
          category: firstParam(resolvedParams.category),
          minPrice: firstParam(resolvedParams.minPrice),
          maxPrice: firstParam(resolvedParams.maxPrice),
          sort: firstParam(resolvedParams.sort) ?? "-createdAt",
        }}
      />

      <ProductGrid
        products={listing.items}
        emptyTitle="Produk tidak ditemukan"
        emptyDescription="Coba ubah filter kategori atau rentang harga, lalu terapkan lagi."
      />

      <CatalogPagination
        page={listing.pagination.page}
        totalPages={listing.pagination.totalPages}
        queryBase={buildQueryBase(urlParams)}
      />
    </Container>
  );
}
