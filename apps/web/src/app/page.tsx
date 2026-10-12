"use client";

import Link from "next/link";
import { ArrowRight, FileText, Blocks, Search, Download } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useIsMounted } from "@/hooks/use-is-mounted";

const SESSION_COOKIE = "tatalaku_session";

/**
 * Reads the session marker cookie once the client has mounted. Before mount it
 * reports false so SSR and the first client render agree (hydration-safe).
 */
function useHasSession(): boolean {
  const mounted = useIsMounted();
  if (!mounted) return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${SESSION_COOKIE}=`));
}

const FEATURES = [
  {
    icon: Blocks,
    title: "Block-based editor",
    description: "Write with flexible blocks: headings, lists, tables, code, and diagrams.",
  },
  {
    icon: FileText,
    title: "Nested pages",
    description: "Organize everything in a tree. Drag to reorder, nest, and restructure freely.",
  },
  {
    icon: Search,
    title: "Instant search",
    description: "Find any page by title or content the moment you start typing.",
  },
  {
    icon: Download,
    title: "Markdown in & out",
    description: "Import your existing notes and export any page back to Markdown.",
  },
];

export default function LandingPage() {
  // Signed-in visitors go straight to their workspace; everyone else signs up.
  const hasSession = useHasSession();

  const primaryHref = hasSession ? "/workspace" : "/register";
  const primaryLabel = hasSession ? "Open workspace" : "Get started";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-codex-surface">
      {/* Soft organic orbs (shared visual language with the auth screens) */}
      <div className="absolute inset-0 pointer-events-none">
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
      <div className="absolute inset-0 backdrop-blur-[80px] bg-codex-surface/30 dark:bg-codex-surface/50 pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Logo size="md" />
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-2 rounded-codex-lg text-sm font-medium text-codex-foreground hover:bg-codex-surface-secondary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href={primaryHref}
            className="px-3 py-2 rounded-codex-lg text-sm font-medium bg-codex-accent text-codex-background hover:bg-codex-accent/90 transition-colors"
          >
            {hasSession ? "Workspace" : "Sign up"}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-16 sm:pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-codex-border bg-codex-surface/60 text-xs font-medium text-codex-muted animate-slide-up-fade opacity-0"
          style={{ animationDelay: "0ms" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-codex-accent" />
          Your calm, block-based workspace
        </div>

        <h1
          className="max-w-3xl text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-codex-foreground animate-slide-up-fade opacity-0"
          style={{ animationDelay: "80ms" }}
        >
          Think, write, and organize in one place.
        </h1>

        <p
          className="mt-6 max-w-xl text-base sm:text-lg text-codex-muted leading-relaxed animate-slide-up-fade opacity-0"
          style={{ animationDelay: "160ms" }}
        >
          Tatalaku is a Notion-style workspace for notes and docs — nested pages, a flexible block
          editor, and instant search. Breathe, focus, create.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row items-center gap-3 animate-slide-up-fade opacity-0"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href={primaryHref}
            className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-codex-xl bg-codex-accent text-codex-background font-medium text-sm hover:bg-codex-accent/90 transition-all shadow-lg shadow-codex-accent/20"
          >
            {primaryLabel}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 px-6 rounded-codex-xl border border-codex-border text-codex-foreground font-medium text-sm hover:bg-codex-surface-secondary transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-5 rounded-codex-2xl border border-codex-border bg-codex-surface/60 backdrop-blur-sm animate-slide-up-fade opacity-0"
              style={{ animationDelay: `${320 + i * 80}ms` }}
            >
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-codex-lg bg-codex-accent/10 text-codex-accent">
                <feature.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-codex-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm text-codex-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 px-6 py-8 text-center text-xs text-codex-muted">
        <p>Tatalaku — a modern block-based workspace.</p>
      </footer>
    </div>
  );
}
