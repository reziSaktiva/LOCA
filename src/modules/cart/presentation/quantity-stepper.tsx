"use client";

import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";

export type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (next: number) => void;
  label?: string;
};

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  disabled = false,
  onChange,
  label = "Jumlah",
}: QuantityStepperProps) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label={label}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || !canDecrease}
        onClick={() => onChange(value - 1)}
        aria-label="Kurangi jumlah"
      >
        <MinusIcon />
      </Button>
      <span className="min-w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || !canIncrease}
        onClick={() => onChange(value + 1)}
        aria-label="Tambah jumlah"
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
