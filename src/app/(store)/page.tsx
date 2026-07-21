import Link from "next/link";

import { ProductSection } from "@/modules/catalog/presentation";
import { HeroBanner } from "@/modules/homepage/presentation";
import { homepageGetData } from "@/modules/homepage/public/homepage-service";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export const metadata = {
  title: "LOCA — Sports Apparel Essentials",
  description: "Brand hub & D2C store untuk sports apparel essentials.",
};

export default async function StoreHomePage() {
  const data = await homepageGetData();
  const hasAnyProducts =
    data.featured.length > 0 || data.newArrivals.length > 0 || data.bestSellers.length > 0;

  return (
    <>
      <HeroBanner banners={data.banners} />

      <Container className="flex flex-col gap-12 py-10 md:gap-16 md:py-14">
        {hasAnyProducts ? (
          <>
            <ProductSection
              title="Featured"
              products={data.featured}
              viewAllHref="/products?sort=-createdAt"
            />
            <ProductSection
              title="New Arrivals"
              products={data.newArrivals}
              viewAllHref="/products?sort=-createdAt"
            />
            <ProductSection
              title="Best Sellers"
              products={data.bestSellers}
              viewAllHref="/products"
            />
          </>
        ) : (
          <section
            role="status"
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center"
          >
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Koleksi segera hadir
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Produk aktif belum tersedia. Silakan cek katalog nanti atau hubungi admin untuk
              menambahkan produk.
            </p>
            <Button nativeButton={false} render={<Link href="/products" />}>
              Ke katalog
            </Button>
          </section>
        )}
      </Container>
    </>
  );
}
