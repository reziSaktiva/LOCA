export const MIN_DISPLAY_NAME_LENGTH = 2;
export const MAX_DISPLAY_NAME_LENGTH = 100;

/**
 * Nama tampilan minimal 2 karakter, maksimal 100 karakter.
 */
export function isValidDisplayName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= MIN_DISPLAY_NAME_LENGTH && trimmed.length <= MAX_DISPLAY_NAME_LENGTH;
}

/**
 * Nomor telepon Indonesia: awalan +62, 62, atau 0, diikuti 8–13 digit.
 * Contoh valid: +6281234567890, 081234567890, 6281234567890
 */
const PHONE_REGEX = /^(\+62|62|0)[0-9]{8,13}$/;

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim());
}
