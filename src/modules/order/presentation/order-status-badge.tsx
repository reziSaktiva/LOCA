import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/ui/utils";

import type { OrderStatus } from "../domain/order-entities";

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Menunggu Konfirmasi",
  WAITING_PAYMENT: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  PROCESSING: "Sedang Diproses",
  SHIPPED: "Sedang Dikirim",
  DELIVERED: "Telah Diterima",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const ORDER_STATUS_CLASSNAME: Record<OrderStatus, string> = {
  PENDING: "bg-warning/10 text-warning",
  WAITING_PAYMENT: "bg-warning/10 text-warning",
  PAID: "bg-info/10 text-info",
  PROCESSING: "bg-info/10 text-info",
  SHIPPED: "bg-info/10 text-info",
  DELIVERED: "bg-success/10 text-success",
  COMPLETED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABEL[status];
}

export type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-transparent", ORDER_STATUS_CLASSNAME[status])}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}
