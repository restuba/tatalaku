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
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-codex-2xl bg-codex-background dark:bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6">
        <FileWarning className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-codex-foreground dark:text-codex-background mb-2">
        Page could not be loaded
      </h2>
      <p className="text-sm text-codex-muted dark:text-codex-muted max-w-md mb-8">
        We couldn&apos;t load this page. It might have been deleted, or you might not have
        permission to view it.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/workspace"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-codex-muted dark:text-codex-muted bg-codex-background dark:bg-codex-sidebar border border-codex-border dark:border-codex-border rounded-codex-xl hover:bg-codex-background dark:hover:bg-codex-sidebar transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go back</span>
        </Link>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-codex-background bg-codex-sidebar dark:bg-codex-background dark:text-codex-foreground rounded-codex-xl hover:bg-codex-sidebar dark:hover:bg-codex-sidebar transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
