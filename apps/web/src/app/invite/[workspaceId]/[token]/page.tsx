"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface InvitePageProps {
  params: Promise<{
    workspaceId: string;
    token: string;
  }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  // In Next.js 15, params is a promise
  const resolvedParams = use(params);
  const { workspaceId, token } = resolvedParams;
  const router = useRouter();
  const { acceptInvite } = useWorkspaceStore();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAccept() {
    setStatus("loading");
    try {
      await acceptInvite(workspaceId, token);
      setStatus("success");
      // Redirect to workspace after a short delay
      setTimeout(() => {
        router.push("/workspace");
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Invalid or expired invitation token.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-codex-surface rounded-codex-2xl border border-codex-border p-8 text-center">
        {status === "idle" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-codex-info-bg dark:bg-codex-info-bg/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-codex-info dark:text-codex-info" />
            </div>
            <h2 className="text-xl font-semibold text-codex-foreground mb-2">
              Workspace Invitation
            </h2>
            <p className="text-codex-muted mb-6">You have been invited to join a workspace.</p>
            <button
              onClick={handleAccept}
              className="px-6 py-2 w-full bg-codex-accent hover:opacity-90 text-codex-background rounded-codex-xl font-medium transition-opacity"
            >
              Accept Invitation
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-codex-accent animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-codex-foreground mb-2">
              Accepting Invitation
            </h2>
            <p className="text-codex-muted">Please wait while we add you to the workspace...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-codex-success-bg dark:bg-codex-success-bg/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-codex-success dark:text-codex-success" />
            </div>
            <h2 className="text-xl font-semibold text-codex-foreground mb-2">
              Invitation Accepted!
            </h2>
            <p className="text-codex-muted">Redirecting you to your workspace...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-codex-danger-bg dark:bg-codex-danger-bg/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-codex-danger dark:text-codex-danger" />
            </div>
            <h2 className="text-xl font-semibold text-codex-foreground mb-2">Invitation Failed</h2>
            <p className="text-codex-danger dark:text-codex-danger mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push("/workspace")}
              className="px-6 py-2 bg-codex-accent hover:opacity-90 text-codex-background rounded-codex-xl font-medium transition-opacity"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
