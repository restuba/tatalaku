This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Fonts (Inter and Fraunces, OFL) are self-hosted from `src/app/fonts/` via `next/font/local`. The design system and the Parchment, Clarity and Nocturne themes are documented in [`docs/design-system.md`](../../docs/design-system.md); `/design-tokens` shows all three themes side by side.

## Tests

- `pnpm test`: Vitest unit tests (`src/**/*.test.ts`, jsdom) for the theme logic, the pre-paint script, the stores and date formatting.
- `pnpm test:e2e`: Playwright checks in `e2e/` against the production build (run `pnpm build` first). They cover the theme being set before the first paint, clean hydration (public pages and the workspace shell), and axe (WCAG 2.2 AA) on the public pages in every theme. No API is needed. Locally they use your installed Google Chrome.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
