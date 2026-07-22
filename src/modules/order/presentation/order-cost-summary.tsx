import { formatIdr } from "@/shared/kernel/format-idr";

import { OrderItemRow, type OrderItemRowData } from "./order-item-row";

export type OrderCostSummaryProps = {
  items: OrderItemRowData[];
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  grandTotal: number;
};

export function OrderCostSummary({
  items,
  subtotal,
  shippingFee,
  discountTotal,
  grandTotal,
}: OrderCostSummaryProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <h2 className="font-heading text-lg font-semibold text-foreground">Item pesanan</h2>

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </ul>

      <dl className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium tabular-nums text-foreground">{formatIdr(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Ongkos kirim</dt>
          <dd className="font-medium tabular-nums text-foreground">{formatIdr(shippingFee)}</dd>
        </div>
        {discountTotal > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Diskon</dt>
            <dd className="font-medium tabular-nums text-foreground">
              -{formatIdr(discountTotal)}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
          <dt className="font-medium text-foreground">Total dibayar</dt>
          <dd className="font-semibold tabular-nums text-foreground">{formatIdr(grandTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
