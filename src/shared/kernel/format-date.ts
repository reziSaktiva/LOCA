const TIME_ZONE = "Asia/Jakarta";

/**
 * Format tanggal (locale id-ID, WIB) untuk tampilan customer-facing.
 *
 * `timeZone` di-set eksplisit ke Asia/Jakarta — jangan rely pada timezone
 * default runtime server (bisa UTC di production), agar tanggal/jam order
 * tidak bergeser (mis. order tengah malam WIB salah tampil di hari sebelumnya).
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Termasuk jam (WIB) — dipakai untuk riwayat/timeline status. */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}
