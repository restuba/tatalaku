/** True for absolute http(s) URLs (rejects javascript:, data:, relative paths). */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Validator for prompt dialogs that expect an image URL. */
export function validateImageUrl(value: string): string | null {
  if (!value.trim()) return "Enter an image URL.";
  return isHttpUrl(value) ? null : "Enter a valid http(s) URL.";
}
