"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileWarning, RefreshCw } from "lucide-react";
import { Button } from "@/components/reusable/button";
import { EmptyState } from "@/components/reusable/empty-state";

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
    <div role="alert" className="flex flex-1 flex-col">
      <EmptyState
        tone="danger"
        icon={<FileWarning className="size-5" />}
        title="This page couldn't be loaded"
        description="It may have been deleted, or you may not have access to it."
        actions={
          <>
            <Link
              href="/workspace"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-codex-border-strong px-4 text-sm font-medium text-codex-foreground transition-colors hover:bg-codex-hover pointer-coarse:h-11"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Home
            </Link>
            <Button
              btnType="primary"
              onClick={() => reset()}
              icon={<RefreshCw className="size-4" />}
            >
              Try again
            </Button>
          </>
        }
      />
    </div>
  );
}
