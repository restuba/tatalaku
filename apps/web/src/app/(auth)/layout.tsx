import type { ReactNode } from "react";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/ui/logo";

interface AuthLayoutProps {
  children: ReactNode;
}

/** Sign-in and sign-up: the form on the canvas, an editorial panel beside it on large screens */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh w-full bg-codex-background">
      <div className="flex flex-1 flex-col px-6 sm:px-12 lg:px-20">
        <header className="flex h-20 shrink-0 items-center">
          <Link href="/" aria-label="Tatalaku home" className="rounded-codex-md">
            <Logo size="md" />
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center pb-20">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      <aside className="hidden flex-1 flex-col justify-between border-l border-codex-border bg-codex-sidebar p-12 lg:flex xl:p-16">
        <LogoMark className="size-9 text-codex-accent" />
        <figure className="max-w-md">
          <blockquote className="font-serif text-4xl font-normal italic leading-tight text-codex-foreground text-balance xl:text-5xl">
            “A quiet room for your thinking.”
          </blockquote>
          <figcaption className="eyebrow mt-6 text-codex-muted">
            Notes · Documents · Plans
          </figcaption>
        </figure>
        <p className="max-w-sm text-sm leading-relaxed text-codex-muted">
          Write in Parchment, Clarity or Nocturne — three calm themes, one workspace.
        </p>
      </aside>
    </div>
  );
}
