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
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-codex-xl bg-codex-danger-bg/10 flex items-center justify-center text-codex-danger mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-codex-foreground mb-2">Something went wrong!</h2>
      <p className="text-sm text-codex-muted max-w-md mb-8">
        We encountered an error loading this workspace. Please try again or return to the dashboard.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-codex-background bg-codex-accent rounded-codex-xl hover:opacity-90 transition-opacity"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try again</span>
      </button>
    </div>
  );
}
