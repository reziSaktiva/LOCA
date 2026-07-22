export type OrderShippingInfoData = {
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  shippingServiceName: string;
  paymentMethodLabel: string;
};

export type OrderShippingInfoProps = {
  info: OrderShippingInfoData;
};

/** Snapshot alamat + pengiriman + pembayaran — immutable sejak order dibuat. */
export function OrderShippingInfo({ info }: OrderShippingInfoProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Pengiriman &amp; pembayaran
      </h2>

      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-foreground">{info.recipientName}</h3>
        <p className="text-sm text-muted-foreground">{info.phone}</p>
        <p className="text-sm text-foreground">
          {info.street}
          <br />
          {info.district}, {info.city}
          <br />
          {info.province} {info.postalCode}
        </p>
      </div>

      <dl className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Pengiriman</dt>
          <dd className="font-medium text-foreground">{info.shippingServiceName}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Pembayaran</dt>
          <dd className="font-medium text-foreground">{info.paymentMethodLabel}</dd>
        </div>
      </dl>
    </article>
  );
}
