import type { Page } from "@playwright/test";

export const THEMES = ["parchment", "clarity", "nocturne"] as const;

/** The persisted theme store as the app writes it */
export function themeStorage(preference: string): string {
  return JSON.stringify({ state: { preference }, version: 1 });
}

declare global {
  interface Window {
    /** data-theme on <html> at the moment <body> started parsing */
    __themeAtFirstPaint?: string | null;
  }
}

/**
 * Seed localStorage before any page script runs. Only on the first document
 * of the test, so reloads see what the app itself saved.
 */
export async function seedStorage(page: Page, entries: Record<string, string>): Promise<void> {
  await page.addInitScript((data) => {
    if (sessionStorage.getItem("__e2e-seeded")) return;
    sessionStorage.setItem("__e2e-seeded", "1");
    for (const [key, value] of Object.entries(data)) localStorage.setItem(key, value);
  }, entries);
}

/**
 * Record the theme as it was when <body> was inserted: nothing in the body
 * can paint before that, so this is the theme of the first frame.
 */
export async function recordThemeAtFirstPaint(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const record = () => {
      window.__themeAtFirstPaint = document.documentElement.getAttribute("data-theme");
    };
    if (document.body) {
      record();
      return;
    }
    // Init scripts can run before <html> exists, so watch the document itself
    const observer = new MutationObserver(() => {
      if (!document.body) return;
      record();
      observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  });
}

/**
 * Open workspace routes without a backend. The proxy only checks this marker
 * cookie, and data requests are held open, so the server-rendered shell stays
 * on screen instead of bouncing to /login.
 */
export async function asSignedInShell(page: Page, baseURL: string): Promise<void> {
  await page.context().addCookies([{ name: "tatalaku_session", value: "e2e", url: baseURL }]);
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type === "fetch" || type === "xhr") return; // never answered
    return route.continue();
  });
}

/** Console errors and uncaught exceptions raised by the page */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}
