"use client";

import type { PublicProductDetailVariant } from "@/modules/catalog/public/catalog-public-service";
import { cn } from "@/shared/ui/utils";

export type VariantSelectorProps = {
  variants: PublicProductDetailVariant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
  className?: string;
};

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  className,
}: VariantSelectorProps) {
  if (variants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Varian belum tersedia.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-sm font-medium text-foreground">Pilih varian</p>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Pilihan varian">
        {variants.map((variant) => {
          const selected = variant.id === selectedVariantId;
          return (
            <button
              key={variant.id}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={!variant.inStock}
              onClick={() => onSelect(variant.id)}
              className={cn(
                "min-h-11 min-w-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-40",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-foreground/40",
              )}
            >
              {variant.variantLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
