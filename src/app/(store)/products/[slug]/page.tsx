import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductDetailPanel, ProductGallery } from "@/modules/catalog/presentation";
import { getPublicProductBySlug } from "@/modules/catalog/public/catalog-public-service";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return { title: "Produk tidak ditemukan — LOCA" };
  }

  return {
    title: `${product.name} — LOCA`,
    description: product.description.slice(0, 160) || `${product.name} dari LOCA.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <Container className="py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Beranda
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href="/products"
              className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Katalog
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery media={product.media} productName={product.name} />
        <ProductDetailPanel product={product} />
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
          Kembali ke katalog
        </Button>
      </div>
    </Container>
  );
}
