export function isValidBannerTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length >= 2 && trimmed.length <= 200;
}

export function isValidMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
