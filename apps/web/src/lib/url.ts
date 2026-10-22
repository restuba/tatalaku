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

/**
 * Turns an untrusted redirect target (e.g. `?from=`) into a same-origin path.
 * Resolving against the current origin applies the browser's own URL parsing,
 * so tricks like `//evil.test`, `/\evil.test` or `javascript:` fall back too.
 */
export function toSameOriginPath(target: string | null, origin: string, fallback: string): string {
  if (!target) return fallback;
  try {
    const url = new URL(target, origin);
    if (url.origin !== origin) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
