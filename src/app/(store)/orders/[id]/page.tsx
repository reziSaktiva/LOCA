import { notFound, redirect } from "next/navigation";

import {
  isOrderCancellable,
  OrderCancelDialog,
  OrderCostSummary,
  OrderShippingInfo,
  OrderStatusBadge,
  OrderStatusTimeline,
} from "@/modules/order/presentation";
import { getOrder } from "@/modules/order/public/order-service";
import { requireCustomer } from "@/shared/infrastructure/auth/customer-guard";
import { formatDate } from "@/shared/kernel/format-date";
import { Container } from "@/shared/ui/container";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return {
    title: `Pesanan ${id} — LOCA`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const guard = await requireCustomer();
  if (!guard.authorized) {
    redirect(`/login?next=/orders/${id}`);
  }

  const result = await getOrder(id);

  if (!result.success || result.data.order.customerId !== guard.userId) {
    notFound();
  }

  const { order, items, statusHistory } = result.data;
  const canCancel = isOrderCancellable(order.orderStatus);

  return (
    <Container className="flex flex-col gap-8 py-8 md:py-12">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
        <p className="text-sm text-muted-foreground">Dipesan pada {formatDate(order.createdAt)}</p>
      </header>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-8">
          <section aria-labelledby="timeline-heading" className="flex flex-col gap-3">
            <h2
              id="timeline-heading"
              className="font-heading text-lg font-semibold text-foreground"
            >
              Status pesanan
            </h2>
            <div className="rounded-xl border border-border p-5">
              <OrderStatusTimeline
                history={statusHistory.map((entry) => ({
                  id: entry.id,
                  toStatus: entry.toStatus,
                  changedAt: entry.changedAt,
                  reason: entry.reason,
                }))}
              />
            </div>
          </section>

          <OrderShippingInfo
            info={{
              recipientName: order.shippingRecipientName,
              phone: order.shippingPhone,
              street: order.shippingStreet,
              district: order.shippingDistrict,
              city: order.shippingCity,
              province: order.shippingProvince,
              postalCode: order.shippingPostalCode,
              shippingServiceName: order.shippingServiceName,
              paymentMethodLabel: order.paymentMethodLabel,
            }}
          />

          {canCancel ? (
            <section aria-labelledby="cancel-heading" className="flex flex-col gap-3">
              <h2
                id="cancel-heading"
                className="font-heading text-lg font-semibold text-foreground"
              >
                Batalkan pesanan
              </h2>
              <p className="text-sm text-muted-foreground">
                Kamu masih bisa membatalkan pesanan ini karena belum diproses.
              </p>
              <div>
                <OrderCancelDialog orderId={order.id} />
              </div>
            </section>
          ) : null}
        </div>

        <div>
          <OrderCostSummary
            items={items.map((item) => ({
              id: item.id,
              productNameSnapshot: item.productNameSnapshot,
              variantLabelSnapshot: item.variantLabelSnapshot,
              thumbnailSnapshot: item.thumbnailSnapshot,
              quantity: item.quantity,
              unitPriceSnapshot: item.unitPriceSnapshot,
              lineTotal: item.lineTotal,
            }))}
            subtotal={order.subtotal}
            shippingFee={order.shippingFee}
            discountTotal={order.discountTotal}
            grandTotal={order.grandTotal}
          />
        </div>
      </div>
    </Container>
  );
}
