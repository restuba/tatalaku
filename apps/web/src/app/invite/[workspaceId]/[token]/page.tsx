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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8 text-center">
        {status === "idle" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Workspace Invitation
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              You have been invited to join a workspace.
            </p>
            <button
              onClick={handleAccept}
              className="px-6 py-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Accept Invitation
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Accepting Invitation
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Please wait while we add you to the workspace...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Invitation Accepted!
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Redirecting you to your workspace...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Invitation Failed
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push("/workspace")}
              className="px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
