"use client";

import { formatIdr } from "@/shared/kernel/format-idr";
import { Button } from "@/shared/ui/button";

import { QuantityStepper } from "./quantity-stepper";

export type CartItemRowData = {
  itemId: string;
  productName: string;
  variantLabel: string;
  thumbnailUrl: string;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
};

export type CartItemRowProps = {
  item: CartItemRowData;
  pending?: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
};

function ItemThumbnail({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div
        aria-hidden
        className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground"
      >
        LOCA
      </div>
    );
  }

  return (
    // Remote media URL dari catalog — host bervariasi.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="size-20 shrink-0 rounded-lg object-cover"
      loading="lazy"
    />
  );
}

export function CartItemRow({
  item,
  pending = false,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  return (
    <article className="flex gap-3 border-b border-border py-4 last:border-b-0 sm:gap-4">
      <ItemThumbnail src={item.thumbnailUrl} alt={item.productName} />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-foreground">{item.productName}</h3>
          <p className="text-sm text-muted-foreground">{item.variantLabel}</p>
          <p className="text-sm tabular-nums text-foreground">{formatIdr(item.unitPrice)}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            disabled={pending}
            onChange={(quantity) => onQuantityChange(item.itemId, quantity)}
          />
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium tabular-nums text-foreground">
              {formatIdr(item.lineSubtotal)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => onRemove(item.itemId)}
            >
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
