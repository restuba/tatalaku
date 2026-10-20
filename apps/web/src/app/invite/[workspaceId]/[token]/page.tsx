"use client";

import { use, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Button } from "@/components/reusable/button";
import { Logo } from "@/components/ui/logo";
import { LogoSpinner } from "@/components/ui/logo-spinner";

interface InvitePageProps {
  params: Promise<{
    workspaceId: string;
    token: string;
  }>;
}

type Status = "idle" | "loading" | "success" | "error";

const ICON_TONE: Record<"accent" | "success" | "danger", string> = {
  accent: "bg-codex-accent-soft text-codex-accent",
  success: "bg-codex-success-bg text-codex-success",
  danger: "bg-codex-danger-bg text-codex-danger",
};

function StatusIcon({ tone, children }: { tone: keyof typeof ICON_TONE; children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={`mb-6 flex size-12 items-center justify-center rounded-full ${ICON_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

export default function InvitePage({ params }: InvitePageProps) {
  const { workspaceId, token } = use(params);
  const router = useRouter();
  const { acceptInvite } = useWorkspaceStore();

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAccept() {
    setStatus("loading");
    try {
      await acceptInvite(workspaceId, token);
      setStatus("success");
      // Redirect to the workspace after a short pause
      setTimeout(() => {
        router.push("/workspace");
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Invalid or expired invitation token.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-codex-background">
      <header className="flex h-20 shrink-0 items-center px-6 sm:px-10">
        <Link href="/" aria-label="Tatalaku home" className="rounded-codex-md">
          <Logo size="md" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-20">
        <div
          className="surface-dialog flex w-full max-w-md flex-col items-center rounded-codex-xl px-8 py-10 text-center"
          aria-live="polite"
        >
          {status === "idle" && (
            <>
              <StatusIcon tone="accent">
                <Mail className="size-5" />
              </StatusIcon>
              <h1 className="font-serif text-3xl font-medium text-codex-foreground">
                You&apos;re invited
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-codex-muted">
                Someone invited you to join their Tatalaku workspace.
              </p>
              <Button btnType="primary" size="large" block className="mt-8" onClick={handleAccept}>
                Accept invitation
              </Button>
            </>
          )}

          {status === "loading" && (
            <>
              <LogoSpinner size="lg" className="mb-6 text-codex-accent" />
              <h1 className="font-serif text-3xl font-medium text-codex-foreground">
                Joining workspace…
              </h1>
              <p className="mt-2 text-sm text-codex-muted">This only takes a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <StatusIcon tone="success">
                <CheckCircle2 className="size-5" />
              </StatusIcon>
              <h1 className="font-serif text-3xl font-medium text-codex-foreground">
                You&apos;re in
              </h1>
              <p className="mt-2 text-sm text-codex-muted">Taking you to your workspace…</p>
            </>
          )}

          {status === "error" && (
            <>
              <StatusIcon tone="danger">
                <AlertCircle className="size-5" />
              </StatusIcon>
              <h1 className="font-serif text-3xl font-medium text-codex-foreground">
                Invitation failed
              </h1>
              <p role="alert" className="mt-2 text-sm leading-relaxed text-codex-danger">
                {errorMessage}
              </p>
              <Button size="large" className="mt-8" onClick={() => router.push("/workspace")}>
                Go to my workspace
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
