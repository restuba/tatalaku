import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { THEMES, seedStorage, themeStorage } from "./helpers";

const ROUTES = ["/", "/login", "/register", "/design-tokens", "/route-that-does-not-exist"];
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// A still frame: the landing demo and transitions settle immediately
test.use({ reducedMotion: "reduce" });

for (const theme of THEMES) {
  test.describe(`axe, ${theme}`, () => {
    for (const route of ROUTES) {
      test(`${route} has no WCAG 2.2 AA violations`, async ({ page }) => {
        await seedStorage(page, { "tatalaku-theme": themeStorage(theme) });
        await page.goto(route);
        await page.waitForLoadState("networkidle");
        expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);

        const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
        // One readable line per rule instead of axe's full result objects
        expect(
          violations.map(
            (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
          ),
        ).toEqual([]);
      });
    }
  });
}
