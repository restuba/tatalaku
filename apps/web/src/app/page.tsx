import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AuroraBackground } from "@/components/shared/aurora-canvas";
import { SESSION_FLAG_COOKIE } from "@/helpers/session-flag";
import { BlockMarquee, EditorDemo, FeatureGrid, HeroHeadline } from "./_components/landing";

export default async function LandingPage() {
  // Read the session marker from the request on the server, so the first paint
  // already shows the right CTA (no client-side cookie read / hydration flip).
  // It's only a hint: a stale marker still gets validated (and cleared) by the
  // workspace layout, which redirects to /login if the session is gone.
  const hasSession = (await cookies()).has(SESSION_FLAG_COOKIE);
  const primaryHref = hasSession ? "/workspace" : "/register";
  const primaryLabel = hasSession ? "Open workspace" : "Get started — it's free";

  return (
    <div className="relative min-h-dvh w-full overflow-x-clip bg-codex-surface">
      {/* Ambient aurora (WebGL, follows the cursor); CSS orbs are the fallback */}
      <AuroraBackground
        className="h-[115dvh]"
        interactive
        fallback={
          <>
            <div className="absolute inset-0">
              <div
                className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-codex-accent opacity-50 dark:opacity-30 blur-[120px] animate-pulse"
                style={{ animationDuration: "12s" }}
              />
              <div className="absolute top-[20%] -right-[15%] w-[70%] h-[70%] rounded-full bg-codex-info opacity-40 dark:opacity-25 blur-[130px]" />
              <div
                className="absolute -bottom-[15%] left-[15%] w-[55%] h-[55%] rounded-full bg-codex-skill opacity-40 dark:opacity-25 blur-[100px] animate-pulse"
                style={{ animationDuration: "18s" }}
              />
            </div>
            <div className="absolute inset-0 backdrop-blur-[80px] bg-codex-surface/30 dark:bg-codex-surface/50" />
          </>
        }
      />
      {/* The aurora melts into the page instead of ending on a hard edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[75dvh] h-[40dvh] bg-linear-to-b from-transparent to-codex-surface"
      />

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-10 py-4 backdrop-blur-md bg-codex-surface/40">
        <Logo size="md" />
        <nav className="flex items-center gap-2">
          {hasSession ? (
            <Link
              href="/workspace"
              className="px-3.5 py-2 rounded-full text-sm font-medium bg-codex-foreground text-codex-background hover:opacity-90 transition-opacity"
            >
              Open workspace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-full text-sm font-medium text-codex-foreground hover:bg-codex-surface-secondary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-2 rounded-full text-sm font-medium bg-codex-foreground text-codex-background hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 flex flex-col items-center px-5 sm:px-6 pt-14 sm:pt-24 pb-24 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-codex-border bg-codex-surface/60 backdrop-blur-sm font-mono text-xs uppercase tracking-widest text-codex-muted animate-slide-up-fade opacity-0"
          style={{ animationDelay: "0ms" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-codex-accent animate-ping" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-codex-accent" />
          </span>
          Block-based workspace
        </div>

        <HeroHeadline />

        <p
          className="mt-8 max-w-xl text-base sm:text-lg text-codex-muted leading-relaxed text-pretty animate-slide-up-fade opacity-0"
          style={{ animationDelay: "260ms" }}
        >
          Nested pages, a flexible block editor, and instant search — in a workspace that stays out
          of your way.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row items-center gap-3 animate-slide-up-fade opacity-0"
          style={{ animationDelay: "340ms" }}
        >
          <Link
            href={primaryHref}
            className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-codex-accent text-codex-background font-medium text-sm hover:opacity-90 transition-opacity"
          >
            {primaryLabel}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          {!hasSession && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-codex-border bg-codex-surface/50 backdrop-blur-sm text-codex-foreground font-medium text-sm hover:bg-codex-surface-secondary transition-colors"
            >
              I have an account
            </Link>
          )}
        </div>

        {/* Product preview: types itself while on screen */}
        <div
          className="mt-16 sm:mt-24 w-full flex justify-center animate-slide-up-fade opacity-0"
          style={{ animationDelay: "440ms" }}
        >
          <EditorDemo />
        </div>

        <div className="mt-16 w-full flex justify-center">
          <BlockMarquee />
        </div>

        {/* Features */}
        <section className="mt-24 sm:mt-32 w-full flex flex-col items-center">
          <p className="font-mono text-xs uppercase tracking-widest text-codex-muted">
            Everything in one place
          </p>
          <h2 className="mt-3 mb-10 max-w-2xl text-3xl sm:text-5xl font-semibold tracking-tight text-codex-foreground text-balance">
            Quietly powerful. <span className="text-codex-muted">Never in the way.</span>
          </h2>
          <FeatureGrid />
        </section>

        {/* Closing call to action */}
        <section className="mt-28 sm:mt-36 w-full max-w-5xl">
          <div className="relative isolate overflow-hidden rounded-codex-2xl border border-codex-border px-6 py-16 sm:py-20">
            <div aria-hidden="true" className="dot-grid absolute inset-0 -z-10 opacity-70" />
            <div
              aria-hidden="true"
              className="home-hero-glow absolute -top-1/2 left-1/4 -z-10 h-full w-1/2"
            />
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-codex-foreground text-balance">
              Start with a blank page.
            </h2>
            <p className="mt-4 text-base text-codex-muted">See where it takes you.</p>
            <Link
              href={primaryHref}
              className="group mt-8 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-codex-foreground text-codex-background font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {primaryLabel}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto px-6 py-10 text-xs text-codex-muted">
        <Logo size="sm" />
        <p>A modern block-based workspace.</p>
      </footer>
    </div>
  );
}
