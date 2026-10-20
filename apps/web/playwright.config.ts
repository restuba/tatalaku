import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Browser checks that unit tests can't make: the theme is on <html> before
 * the first paint, pages hydrate without mismatches, and axe finds no
 * WCAG 2.2 AA violations. They need no API: workspace routes are checked as
 * their server-rendered shell.
 *
 * Runs against the production build, so build first:
 *   pnpm --filter @tatalaku/web build && pnpm --filter @tatalaku/web test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Locally use the installed Google Chrome; CI installs Playwright's Chromium
    ...(process.env.CI ? {} : { channel: "chrome" }),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // next start warns that it isn't meant for `output: "standalone"`; it still
    // serves the same build, which is all these checks need (Docker runs the
    // standalone server.js)
    command: `pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
