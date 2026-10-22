"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/reusable/button";
import { EmptyState } from "@/components/reusable/empty-state";

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
    <div role="alert" className="flex flex-1 flex-col">
      <EmptyState
        tone="danger"
        icon={<AlertCircle className="size-5" />}
        title="Something went wrong"
        description="This workspace couldn't be loaded. Try again, or come back in a moment."
        actions={
          <Button btnType="primary" onClick={() => reset()} icon={<RefreshCw className="size-4" />}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
