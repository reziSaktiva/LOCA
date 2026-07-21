import Link from "next/link";

import type { PublicProductCard } from "@/modules/catalog/public/catalog-public-service";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/ui/utils";

import { ProductGrid } from "./product-grid";

export type ProductSectionProps = {
  title: string;
  products: PublicProductCard[];
  viewAllHref?: string;
  className?: string;
  /** Sembunyikan section jika daftar produk kosong. Default: true. */
  hideWhenEmpty?: boolean;
};

export function ProductSection({
  title,
  products,
  viewAllHref,
  className,
  hideWhenEmpty = true,
}: ProductSectionProps) {
  if (hideWhenEmpty && products.length === 0) {
    return null;
  }

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
        {viewAllHref ? (
          <Button
            variant="link"
            size="sm"
            nativeButton={false}
            render={<Link href={viewAllHref} />}
            className="shrink-0 text-brand-accent"
          >
            Lihat semua
          </Button>
        ) : null}
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
