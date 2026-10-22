import { expect, test, type Page } from "@playwright/test";
import { THEMES, recordThemeAtFirstPaint, seedStorage, themeStorage } from "./helpers";

const theme = (page: Page) =>
  page.evaluate(() => document.documentElement.getAttribute("data-theme"));
const themeAtFirstPaint = (page: Page) => page.evaluate(() => window.__themeAtFirstPaint);

test.describe("theme before the first paint", () => {
  test("a first visit gets Parchment", async ({ page }) => {
    await recordThemeAtFirstPaint(page);
    await page.goto("/login");
    expect(await themeAtFirstPaint(page)).toBe("parchment");
  });

  for (const id of THEMES) {
    test(`a stored ${id} theme paints without a flash`, async ({ page }) => {
      await seedStorage(page, { "tatalaku-theme": themeStorage(id) });
      await recordThemeAtFirstPaint(page);
      await page.goto("/login");
      expect(await themeAtFirstPaint(page)).toBe(id);
      await page.reload();
      expect(await themeAtFirstPaint(page)).toBe(id);
    });
  }
});

test.describe("Match system", () => {
  test.describe("dark device", () => {
    test.use({ colorScheme: "dark" });
    test("uses Nocturne", async ({ page }) => {
      await seedStorage(page, { "tatalaku-theme": themeStorage("system") });
      await recordThemeAtFirstPaint(page);
      await page.goto("/");
      expect(await themeAtFirstPaint(page)).toBe("nocturne");
    });
  });

  test.describe("light device", () => {
    test.use({ colorScheme: "light" });
    test("uses Parchment", async ({ page }) => {
      await seedStorage(page, { "tatalaku-theme": themeStorage("system") });
      await page.goto("/");
      expect(await theme(page)).toBe("parchment");
    });
  });
});

test("the old light/dark switch carries over and its keys are cleaned up", async ({ page }) => {
  await seedStorage(page, { theme: "dark" });
  await recordThemeAtFirstPaint(page);
  await page.goto("/login");
  expect(await themeAtFirstPaint(page)).toBe("nocturne");

  // ThemeSync stores the carried-over choice and drops the old key
  await expect.poll(() => page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
  const stored = await page.evaluate(() => localStorage.getItem("tatalaku-theme"));
  expect(JSON.parse(stored ?? "{}")).toMatchObject({ state: { preference: "nocturne" } });
});
