import type { Metadata } from "next";
import Link from "next/link";

import {
  CatalogPagination,
  ProductGrid,
  SearchForm,
} from "@/modules/catalog/presentation";
import { searchPublicProductsFromSearchParams } from "@/modules/catalog/public/catalog-public-service";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export const metadata: Metadata = {
  title: "Cari produk — LOCA",
  description: "Temukan sports apparel essentials LOCA.",
};

type SearchPageProps = {
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const urlParams = toUrlSearchParams(resolvedParams);
  const q = (firstParam(resolvedParams.q) ?? "").trim();

  if (!q) {
    return (
      <Container className="flex flex-col gap-8 py-8 md:py-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Cari produk
          </h1>
          <p className="text-sm text-muted-foreground">
            Ketik kata kunci untuk menemukan produk LOCA.
          </p>
        </header>
        <SearchForm key="empty" initialQuery="" />
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center"
        >
          <p className="font-heading text-base font-semibold text-foreground">
            Mulai pencarian
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Masukkan nama produk, brand, atau deskripsi di kolom di atas.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
            Jelajahi katalog
          </Button>
        </div>
      </Container>
    );
  }

  const result = await searchPublicProductsFromSearchParams(urlParams);

  if (!result.success) {
    return (
      <Container className="flex flex-col gap-8 py-8 md:py-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Cari produk
          </h1>
        </header>
        <SearchForm key={`error-${q}`} initialQuery={q} />
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
          <p className="text-sm text-destructive">{result.error.message}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Hasil pencarian
        </h1>
        <p className="text-sm text-muted-foreground">
          {result.pagination.total > 0
            ? `${result.pagination.total} hasil untuk “${q}”`
            : `Tidak ada hasil untuk “${q}”`}
        </p>
      </header>

      <SearchForm key={q} initialQuery={q} />

      <ProductGrid
        products={result.items}
        emptyTitle="Produk tidak ditemukan"
        emptyDescription="Coba kata kunci lain, atau jelajahi katalog lengkap."
      />

      {result.pagination.total === 0 ? (
        <div className="flex justify-center">
          <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
            Ke katalog
          </Button>
        </div>
      ) : null}

      <CatalogPagination
        page={result.pagination.page}
        totalPages={result.pagination.totalPages}
        queryBase={buildQueryBase(urlParams)}
        basePath="/search"
      />
    </Container>
  );
}
