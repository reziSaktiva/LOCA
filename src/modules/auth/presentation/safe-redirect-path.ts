/**
 * Validasi path redirect pasca-login agar tidak open-redirect ke host eksternal.
 * Hanya izinkan relative path yang diawali `/` (bukan protocol-relative `//`).
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) {
    return fallback;
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}
