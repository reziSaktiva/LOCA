const IDR_FORMATTER = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format amount (IDR, whole rupiah) for customer-facing display. */
export function formatIdr(amount: number): string {
  return IDR_FORMATTER.format(amount);
}
