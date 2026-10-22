import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemePreview } from "@/components/shared/theme-preview";
import { SESSION_FLAG_COOKIE } from "@/helpers/session-flag";
import { THEMES } from "@/lib/themes";
import { BlockList, EditorDemo, FeatureGrid, HeroHeadline } from "./_components/landing";

/** Pill links styled like the app's buttons (links keep their native semantics) */
const PRIMARY_LINK =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-codex-accent px-6 text-sm font-medium text-codex-background transition-colors hover:bg-codex-accent-hover";
const SECONDARY_LINK =
  "inline-flex h-11 items-center justify-center rounded-full border border-codex-border-strong px-6 text-sm font-medium text-codex-foreground transition-colors hover:bg-codex-hover";

export default async function LandingPage() {
  // Read the session marker from the request on the server, so the first paint
  // already shows the right CTA (no client-side cookie read / hydration flip).
  // It's only a hint: a stale marker still gets validated (and cleared) by the
  // workspace layout, which redirects to /login if the session is gone.
  const hasSession = (await cookies()).has(SESSION_FLAG_COOKIE);
  const primaryHref = hasSession ? "/workspace" : "/register";
  const primaryLabel = hasSession ? "Open workspace" : "Get started — it's free";

  return (
    <div className="min-h-dvh w-full bg-codex-background">
      <header className="sticky top-0 z-20 border-b border-codex-border bg-codex-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
          <Link href="/" aria-label="Tatalaku home" className="rounded-codex-md">
            <Logo size="md" />
          </Link>
          <nav aria-label="Account" className="flex items-center gap-2">
            {hasSession ? (
              <Link
                href="/workspace"
                className="inline-flex h-9 items-center rounded-full bg-codex-accent px-4 text-sm font-medium text-codex-background transition-colors hover:bg-codex-accent-hover"
              >
                Open workspace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-codex-foreground transition-colors hover:bg-codex-hover"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center rounded-full bg-codex-accent px-4 text-sm font-medium text-codex-background transition-colors hover:bg-codex-accent-hover"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-col items-center px-5 pt-16 pb-24 text-center sm:px-6 sm:pt-24">
        <p className="eyebrow mb-8 flex items-center gap-2 text-codex-muted">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-codex-accent-secondary" />
          Block-based workspace
        </p>

        <HeroHeadline />

        <p className="mt-8 max-w-xl text-base leading-relaxed text-codex-muted text-pretty sm:text-lg">
          Nested pages, a flexible block editor and instant search — in a workspace that stays quiet
          while you read and write.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link href={primaryHref} className={PRIMARY_LINK}>
            {primaryLabel}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          {!hasSession && (
            <Link href="/login" className={SECONDARY_LINK}>
              I have an account
            </Link>
          )}
        </div>

        {/* Product preview: types itself while on screen */}
        <div className="mt-16 flex w-full justify-center sm:mt-24">
          <EditorDemo />
        </div>

        <div className="mt-12 flex w-full justify-center">
          <BlockList />
        </div>

        {/* Features */}
        <section
          aria-labelledby="landing-features"
          className="mt-28 flex w-full flex-col items-center sm:mt-36"
        >
          <p className="eyebrow text-codex-muted">Everything in one place</p>
          <h2
            id="landing-features"
            className="mt-4 mb-14 max-w-2xl font-serif text-4xl font-normal leading-tight text-codex-foreground text-balance sm:text-5xl"
          >
            Quietly capable. <span className="italic text-codex-muted">Never in the way.</span>
          </h2>
          <FeatureGrid />
        </section>

        {/* Themes */}
        <section
          aria-labelledby="landing-themes"
          className="mt-28 flex w-full max-w-5xl flex-col items-center sm:mt-36"
        >
          <p className="eyebrow text-codex-muted">Three themes, one design</p>
          <h2
            id="landing-themes"
            className="mt-4 max-w-2xl font-serif text-4xl font-normal leading-tight text-codex-foreground text-balance sm:text-5xl"
          >
            Pick the light you read best in.
          </h2>
          <ul className="mt-14 grid w-full grid-cols-1 gap-6 text-left sm:grid-cols-3">
            {THEMES.map((theme) => (
              <li key={theme.id}>
                <ThemePreview theme={theme.id} />
                <h3 className="mt-4 text-sm font-medium text-codex-foreground">
                  {theme.name}
                  <span className="ml-2 font-normal text-codex-muted">{theme.style}</span>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-codex-muted">{theme.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing call to action */}
        <section className="mt-28 w-full max-w-5xl sm:mt-36">
          <div className="rounded-codex-2xl border border-codex-border bg-codex-sidebar px-6 py-16 sm:py-20">
            <h2 className="font-serif text-4xl font-normal leading-tight text-codex-foreground text-balance sm:text-5xl">
              Start with a blank page.
            </h2>
            <p className="mt-4 text-base text-codex-muted">See where it takes you.</p>
            <Link href={primaryHref} className={`${PRIMARY_LINK} mt-8`}>
              {primaryLabel}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-codex-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-codex-muted sm:flex-row sm:px-10">
          <Logo size="sm" />
          <p>A calm, block-based workspace.</p>
        </div>
      </footer>
    </div>
  );
}
