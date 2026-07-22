import Link from "next/link";

import { formatIdr } from "@/shared/kernel/format-idr";
import { Button } from "@/shared/ui/button";

export type CartSummaryProps = {
  subtotal: number;
  itemCount: number;
};

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <h2 className="font-heading text-lg font-semibold text-foreground">Ringkasan</h2>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">
            Subtotal ({itemCount} item)
          </dt>
          <dd className="font-medium tabular-nums text-foreground">{formatIdr(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
          <dt className="font-medium text-foreground">Total</dt>
          <dd className="font-semibold tabular-nums text-foreground">{formatIdr(subtotal)}</dd>
        </div>
      </dl>

      <Button type="button" size="lg" className="w-full" disabled>
        Lanjut ke Checkout
      </Button>
      <p className="text-xs text-muted-foreground">
        Checkout akan aktif di fase berikutnya.{" "}
        <Link
          href="/products"
          className="font-medium text-brand-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Lanjut belanja
        </Link>
      </p>
    </aside>
  );
}
