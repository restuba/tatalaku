import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    globals: true,
    environment: "node",
    env: {
      CLIENT_URL: "http://localhost:3000",
      MONGODB_URI: "mongodb://localhost:27017/test",
      JWT_ACCESS_SECRET: "test-access-secret-which-is-at-least-32-chars",
      JWT_REFRESH_SECRET: "test-refresh-secret-which-is-at-least-32-chars",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
