import { expect, test } from "@playwright/test";
import { asSignedInShell, collectErrors, seedStorage, themeStorage } from "./helpers";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/design-tokens"];
/** Server-rendered as skeletons: the data loads client-side after auth */
const WORKSPACE_ROUTES = ["/workspace", "/workspace/0123456789abcdef01234567"];

/**
 * Persisted preferences that change what renders. Components must read them
 * only after hydration, or the server and client markup disagree.
 */
const PRESETS: Record<string, Record<string, string>> = {
  "first visit": {},
  "customised device": {
    "tatalaku-theme": themeStorage("nocturne"),
    "tatalaku-ui-v1": JSON.stringify({
      state: {
        motion: "off",
        readingSize: "large",
        isSidebarOpen: false,
        isOutlineOpen: true,
        isFullWidth: true,
        hasUsedCommandPalette: true,
        isOnboardingDismissed: true,
        lastSettingsTab: "appearance",
      },
      version: 0,
    }),
  },
};

/**
 * Production React reports hydration failures as minified errors (#418 text,
 * #423 and #425 recoverable), not by name. Attribute-only mismatches are
 * silent in production builds; those only show up under `next dev`.
 */
const HYDRATION_ERROR = /hydrat|Minified React error #4(18|19|21|22|23|25)/i;
const hydrationErrors = (errors: string[]) => errors.filter((e) => HYDRATION_ERROR.test(e));

for (const [preset, storage] of Object.entries(PRESETS)) {
  test.describe(`hydration (${preset})`, () => {
    for (const route of PUBLIC_ROUTES) {
      test(`${route} hydrates cleanly`, async ({ page }) => {
        const errors = collectErrors(page);
        await seedStorage(page, storage);
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        expect(hydrationErrors(errors)).toEqual([]);
      });
    }

    for (const route of WORKSPACE_ROUTES) {
      test(`${route} shell hydrates cleanly`, async ({ page, baseURL }) => {
        const errors = collectErrors(page);
        await asSignedInShell(page, baseURL ?? "");
        await seedStorage(page, storage);
        await page.goto(route);
        await expect(page.locator("[aria-busy='true'], .animate-pulse").first()).toBeVisible();
        expect(hydrationErrors(errors)).toEqual([]);
      });
    }
  });
}
