import { formatIdr } from "@/shared/kernel/format-idr";

export type CheckoutOrderItemData = {
  itemId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  lineSubtotal: number;
};

export type CheckoutOrderSummaryProps = {
  items: CheckoutOrderItemData[];
  itemsSubtotal: number;
  shippingFee: number | null;
  grandTotal: number;
};

export function CheckoutOrderSummary({
  items,
  itemsSubtotal,
  shippingFee,
  grandTotal,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <h2 className="font-heading text-lg font-semibold text-foreground">Ringkasan pesanan</h2>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.itemId} className="flex items-start justify-between gap-3 text-sm">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{item.productName}</span>
              <span className="text-muted-foreground">
                {item.variantLabel} · {item.quantity}x
              </span>
            </div>
            <span className="shrink-0 font-medium tabular-nums text-foreground">
              {formatIdr(item.lineSubtotal)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium tabular-nums text-foreground">{formatIdr(itemsSubtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Ongkos kirim</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {shippingFee === null ? "Pilih pengiriman dulu" : formatIdr(shippingFee)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
          <dt className="font-medium text-foreground">Total</dt>
          <dd className="font-semibold tabular-nums text-foreground">{formatIdr(grandTotal)}</dd>
        </div>
      </dl>
    </aside>
  );
}
