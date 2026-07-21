"use client";

import { useMemo, useState } from "react";

import type { PublicProductDetail } from "@/modules/catalog/public/catalog-public-service";
import { Badge } from "@/shared/ui/badge";

import { AddToCartButton } from "./add-to-cart-button";
import { PriceDisplay } from "./price-display";
import { VariantSelector } from "./variant-selector";

export type ProductDetailPanelProps = {
  product: PublicProductDetail;
};

export function ProductDetailPanel({ product }: ProductDetailPanelProps) {
  const defaultVariantId = useMemo(() => {
    const inStock = product.variants.find((variant) => variant.inStock);
    return inStock?.id ?? product.variants[0]?.id ?? null;
  }, [product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(defaultVariantId);

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? null;

  const priceFrom = selectedVariant?.price ?? product.priceFrom;
  const priceTo = selectedVariant?.price ?? product.priceTo;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {product.brand}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {product.name}
        </h1>
        <PriceDisplay priceFrom={priceFrom} priceTo={priceTo} className="text-lg" />
      </div>

      <VariantSelector
        variants={product.variants}
        selectedVariantId={selectedVariantId}
        onSelect={setSelectedVariantId}
      />

      {selectedVariant ? (
        <div className="flex items-center gap-2">
          {selectedVariant.inStock ? (
            <Badge variant="secondary">Stok tersedia ({selectedVariant.availableQty})</Badge>
          ) : (
            <Badge variant="destructive">Stok habis</Badge>
          )}
        </div>
      ) : null}

      <AddToCartButton
        variantId={selectedVariantId}
        productSlug={product.slug}
        disabled={!selectedVariant?.inStock}
      />

      {product.description ? (
        <div className="flex flex-col gap-2 border-t border-border pt-6">
          <h2 className="font-heading text-base font-semibold text-foreground">Deskripsi</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
