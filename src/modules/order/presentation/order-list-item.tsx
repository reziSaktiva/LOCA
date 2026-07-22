import Link from "next/link";

import { formatDate } from "@/shared/kernel/format-date";
import { formatIdr } from "@/shared/kernel/format-idr";

import type { OrderStatus } from "../domain/order-entities";
import { OrderStatusBadge } from "./order-status-badge";

export type OrderListItemData = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  orderStatus: OrderStatus;
  grandTotal: number;
  shippingCity: string;
  shippingProvince: string;
};

export type OrderListItemProps = {
  order: OrderListItemData;
};

export function OrderListItem({ order }: OrderListItemProps) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium text-foreground">{order.orderNumber}</span>
        <span className="text-sm text-muted-foreground">
          {formatDate(order.createdAt)} · {order.shippingCity}, {order.shippingProvince}
        </span>
      </div>
      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
        <OrderStatusBadge status={order.orderStatus} />
        <span className="font-semibold tabular-nums text-foreground">
          {formatIdr(order.grandTotal)}
        </span>
      </div>
    </Link>
  );
}
