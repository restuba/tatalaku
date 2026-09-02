import { LogoSpinner } from "@/components/ui/logo-spinner";

export default function WorkspaceLoading() {
  return (
    <div className="flex-1 h-full min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Zen Canvas Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-codex-accent opacity-30 dark:opacity-20 blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[20%] right-[30%] w-[30%] h-[30%] rounded-full bg-codex-skill opacity-30 dark:opacity-20 blur-[100px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
      </div>

      <div
        className="relative z-10 flex flex-col items-center justify-center opacity-0 animate-slide-up-fade"
        style={{ animationDelay: "100ms" }}
      >
        <LogoSpinner size="lg" className="w-12 h-12 text-codex-accent" />
        <p className="mt-6 text-sm font-medium text-codex-muted tracking-wide">
          Entering sanctuary...
        </p>
      </div>
    </div>
  );
}
