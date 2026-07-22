/**
 * Format amount (IDR, whole rupiah) for customer-facing display.
 *
 * Menghindari `style: "currency"` karena ICU antar OS/Node bisa beda
 * spasi setelah simbol (`Rp150.000` vs `Rp 150.000`).
 */
export function formatIdr(amount: number): string {
  const numberPart = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `Rp${numberPart}`;
}
