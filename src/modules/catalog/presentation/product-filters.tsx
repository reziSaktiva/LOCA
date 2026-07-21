import Link from "next/link";

import type { PublicCategory } from "@/modules/catalog/public/catalog-public-service";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/ui/utils";

export type ProductFiltersValues = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export type ProductFiltersProps = {
  categories: PublicCategory[];
  values: ProductFiltersValues;
  className?: string;
};

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Terbaru" },
  { value: "createdAt", label: "Terlama" },
  { value: "priceFrom", label: "Harga terendah" },
  { value: "-priceFrom", label: "Harga tertinggi" },
] as const;

const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30",
);

/**
 * Filter katalog berbasis URL state (form GET).
 * Tidak memakai client select agar tetap Server Component + accessible.
 */
export function ProductFilters({ categories, values, className }: ProductFiltersProps) {
  return (
    <form
      method="get"
      action="/products"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 md:flex-row md:flex-wrap md:items-end",
        className,
      )}
      aria-label="Filter produk"
    >
      <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
        <label htmlFor="catalog-category" className="text-xs font-medium text-muted-foreground">
          Kategori
        </label>
        <select
          id="catalog-category"
          name="category"
          defaultValue={values.category ?? ""}
          className={selectClassName}
        >
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[7rem] flex-1 flex-col gap-1.5">
        <label htmlFor="catalog-min-price" className="text-xs font-medium text-muted-foreground">
          Harga min
        </label>
        <Input
          id="catalog-min-price"
          name="minPrice"
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          placeholder="0"
          defaultValue={values.minPrice ?? ""}
        />
      </div>

      <div className="flex min-w-[7rem] flex-1 flex-col gap-1.5">
        <label htmlFor="catalog-max-price" className="text-xs font-medium text-muted-foreground">
          Harga max
        </label>
        <Input
          id="catalog-max-price"
          name="maxPrice"
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          placeholder="—"
          defaultValue={values.maxPrice ?? ""}
        />
      </div>

      <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
        <label htmlFor="catalog-sort" className="text-xs font-medium text-muted-foreground">
          Urutkan
        </label>
        <select
          id="catalog-sort"
          name="sort"
          defaultValue={values.sort ?? "-createdAt"}
          className={selectClassName}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 md:pb-0">
        <Button type="submit" size="default" className="flex-1 md:flex-none">
          Terapkan
        </Button>
        <Button
          type="reset"
          variant="outline"
          size="default"
          nativeButton={false}
          render={<Link href="/products" />}
          className="flex-1 md:flex-none"
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
