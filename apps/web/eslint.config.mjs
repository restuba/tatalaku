import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import rootConfig from "../../eslint.config.mjs";

const eslintConfig = defineConfig([
  ...rootConfig,
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "test-results/**",
    "playwright-report/**",
    "blob-report/**",
  ]),
]);

export default eslintConfig;
