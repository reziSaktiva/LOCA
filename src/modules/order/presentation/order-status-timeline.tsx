import { formatDateTime } from "@/shared/kernel/format-date";

import type { OrderStatus } from "../domain/order-entities";
import { orderStatusLabel } from "./order-status-badge";

export type OrderStatusTimelineEntry = {
  id: string;
  toStatus: OrderStatus;
  changedAt: Date;
  reason: string | null;
};

export type OrderStatusTimelineProps = {
  history: OrderStatusTimelineEntry[];
};

/** Riwayat status berurutan kronologis (lama -> baru). */
export function OrderStatusTimeline({ history }: OrderStatusTimelineProps) {
  return (
    <ol className="flex flex-col gap-4">
      {history.map((entry, index) => {
        const isLatest = index === history.length - 1;
        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span
                aria-hidden
                className={
                  isLatest ? "size-2.5 rounded-full bg-primary" : "size-2.5 rounded-full bg-border"
                }
              />
              {index < history.length - 1 ? (
                <span aria-hidden className="mt-1 w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div className="flex flex-col gap-0.5 pb-1">
              <span className="font-medium text-foreground">
                {orderStatusLabel(entry.toStatus)}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(entry.changedAt)}
              </span>
              {entry.reason ? (
                <span className="text-sm text-muted-foreground">{entry.reason}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
