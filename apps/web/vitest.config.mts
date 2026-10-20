import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the web app's pure logic (themes, pre-paint script, stores,
// formatting). Browser-level checks live in e2e/ and run with Playwright.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
  },
});
