import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.tsbuildinfo",
      "**/.husky/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/-\\[#[a-fA-F0-9]{3,8}\\]/]",
          message:
            "Arbitrary Tailwind colors (e.g., bg-[#fff]) are strictly prohibited. Use Codex design tokens.",
        },
        {
          selector: "TemplateElement[value.raw=/-\\[#[a-fA-F0-9]{3,8}\\]/]",
          message:
            "Arbitrary Tailwind colors inside template literals are strictly prohibited. Use Codex design tokens.",
        },
        {
          selector:
            "JSXAttribute[name.name='style'] Property[key.name=/(color|backgroundColor|borderColor)/i] Literal[value=/^#|^rgb/i]",
          message:
            "Hardcoding hex/rgb colors in inline styles is prohibited. Use Codex design tokens via className.",
        },
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/i]",
          message:
            "Writing or declaring raw hex colors directly in code files is prohibited. All colors MUST use Codex design tokens.",
        },
      ],
    },
  },
);
