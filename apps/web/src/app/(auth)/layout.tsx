import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-codex-surface">
      {/* Left side: Form (Pristine Canvas) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative z-10 bg-codex-surface shadow-2xl shadow-black/5 dark:shadow-black/20">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Logo size="md" />
        </div>

        <div className="w-full max-w-sm mx-auto">{children}</div>
      </div>

      {/* Right side: Zen Canvas Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-codex-surface/10">
        {/* Soft Organic Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Orb 1: Accent */}
          <div
            className="absolute -top-[5%] -left-[10%] w-[70%] h-[70%] rounded-full bg-codex-accent opacity-60 dark:opacity-40 blur-[120px] animate-pulse"
            style={{ animationDuration: "12s" }}
          />

          {/* Orb 2: Info */}
          <div className="absolute top-[30%] -right-[15%] w-[80%] h-[80%] rounded-full bg-codex-info opacity-50 dark:opacity-30 blur-[130px]" />

          {/* Orb 3: Skill */}
          <div
            className="absolute -bottom-[10%] left-[10%] w-[60%] h-[60%] rounded-full bg-codex-skill opacity-50 dark:opacity-30 blur-[100px] animate-pulse"
            style={{ animationDuration: "18s" }}
          />
        </div>

        {/* Frosted Glass Overlay */}
        <div className="absolute inset-0 backdrop-blur-[80px] bg-codex-surface/30 dark:bg-codex-surface/50 pointer-events-none" />

        {/* Large Faint Logo Floating in Zen Space */}
        <div className="relative z-10 flex flex-col items-center opacity-10 dark:opacity-20 pointer-events-none transform scale-[2] translate-x-12">
          <Logo
            variant="icon-only"
            size="xl"
            className="w-64 h-64 text-codex-foreground drop-shadow-2xl mix-blend-overlay"
          />
        </div>

        {/* Decorative Quote */}
        <div className="absolute bottom-12 left-12 right-12 z-20 text-codex-muted text-sm font-medium">
          <p className="text-codex-foreground/60 tracking-wide font-light">
            &quot;Breathe. Focus. Create.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
