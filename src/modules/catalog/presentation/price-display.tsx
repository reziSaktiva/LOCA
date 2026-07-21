import { cn } from "@/shared/ui/utils";

import { formatIdr } from "./format-idr";

export type PriceDisplayProps = {
  priceFrom: number;
  priceTo: number;
  className?: string;
};

export function PriceDisplay({ priceFrom, priceTo, className }: PriceDisplayProps) {
  const label =
    priceFrom === priceTo
      ? formatIdr(priceFrom)
      : `${formatIdr(priceFrom)} – ${formatIdr(priceTo)}`;

  return <p className={cn("text-sm font-medium tabular-nums text-foreground", className)}>{label}</p>;
}
