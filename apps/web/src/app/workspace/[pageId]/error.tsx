"use client";

import { useEffect } from "react";
import { FileWarning, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center animate-in fade-in duration-200">
      {/* A bare mark in the danger color, no tinted tile */}
      <div className="mb-6 flex items-center justify-center text-codex-danger">
        <FileWarning className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-codex-foreground">
        Page could not be loaded
      </h2>
      <p className="mt-3 max-w-md text-sm text-codex-muted">
        We couldn&apos;t load this page. It might have been deleted, or you might not have
        permission to view it.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {/* Secondary: outlined pill */}
        <Link
          href="/workspace"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-codex-border-strong px-5 font-mono text-xs uppercase tracking-label text-codex-foreground transition-colors hover:border-codex-muted pointer-coarse:h-11"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go back</span>
        </Link>
        {/* Primary: the one solid action */}
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-codex-accent px-5 font-mono text-xs uppercase tracking-label text-codex-background transition-opacity hover:opacity-85 pointer-coarse:h-11"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
