import { formatIdr } from "@/shared/kernel/format-idr";

export type OrderItemRowData = {
  id: string;
  productNameSnapshot: string;
  variantLabelSnapshot: string;
  thumbnailSnapshot: string;
  quantity: number;
  unitPriceSnapshot: number;
  lineTotal: number;
};

export type OrderItemRowProps = {
  item: OrderItemRowData;
};

function ItemThumbnail({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div
        aria-hidden
        className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground"
      >
        LOCA
      </div>
    );
  }

  return (
    // Remote media URL dari catalog snapshot — host bervariasi.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="size-16 shrink-0 rounded-lg object-cover" loading="lazy" />
  );
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <li className="flex items-start gap-4">
      <ItemThumbnail src={item.thumbnailSnapshot} alt={item.productNameSnapshot} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-medium text-foreground">{item.productNameSnapshot}</span>
        <span className="text-sm text-muted-foreground">
          {item.variantLabelSnapshot} · {item.quantity}x {formatIdr(item.unitPriceSnapshot)}
        </span>
      </div>
      <span className="shrink-0 font-medium tabular-nums text-foreground">
        {formatIdr(item.lineTotal)}
      </span>
    </li>
  );
}
