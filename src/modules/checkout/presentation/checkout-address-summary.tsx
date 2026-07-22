import Link from "next/link";

import { Badge } from "@/shared/ui/badge";

export type CheckoutAddressSummaryData = {
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

export type CheckoutAddressSummaryProps = {
  address: CheckoutAddressSummaryData;
};

/**
 * Alamat pengiriman checkout bersifat view-only (Decision 028): sesi checkout
 * otomatis memakai alamat default/pertama customer (M7.3). Ganti alamat
 * dilakukan lewat halaman akun, bukan di halaman checkout.
 */
export function CheckoutAddressSummary({ address }: CheckoutAddressSummaryProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-foreground">{address.recipientName}</h3>
          <p className="text-sm text-muted-foreground">{address.phone}</p>
        </div>
        {address.isDefault ? <Badge variant="secondary">Utama</Badge> : null}
      </div>

      <p className="text-sm text-foreground">
        {address.street}
        <br />
        {address.district}, {address.city}
        <br />
        {address.province} {address.postalCode}
      </p>

      <Link
        href="/account"
        className="text-sm font-medium text-brand-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Kelola alamat
      </Link>
    </article>
  );
}
