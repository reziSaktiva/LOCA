import Link from "next/link";

import { Button } from "@/shared/ui/button";

export type OrderEmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export function OrderEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: OrderEmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center"
    >
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      <Button nativeButton={false} render={<Link href={actionHref} />}>
        {actionLabel}
      </Button>
    </div>
  );
}
