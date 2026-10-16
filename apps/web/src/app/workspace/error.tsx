"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function WorkspaceError({
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
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-codex-foreground">
        Something went wrong!
      </h2>
      <p className="mt-3 max-w-md text-sm text-codex-muted">
        We encountered an error loading this workspace. Please try again or return to the dashboard.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 inline-flex h-9 items-center gap-2 rounded-full bg-codex-accent px-5 font-mono text-xs uppercase tracking-label text-codex-background transition-opacity hover:opacity-85 pointer-coarse:h-11"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try again</span>
      </button>
    </div>
  );
}
