import type { PublicProductCard } from "@/modules/catalog/public/catalog-public-service";
import { cn } from "@/shared/ui/utils";

import { ProductCard } from "./product-card";

export type ProductGridProps = {
  products: PublicProductCard[];
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ProductGrid({
  products,
  className,
  emptyTitle = "Belum ada produk",
  emptyDescription = "Produk aktif akan muncul di sini setelah tersedia.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center",
          className,
        )}
      >
        <p className="font-heading text-base font-semibold text-foreground">{emptyTitle}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "grid list-none grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6",
        className,
      )}
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
