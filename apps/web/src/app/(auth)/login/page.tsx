"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ApiRequestError } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

import { Suspense } from "react";
import { LogoSpinner } from "@/components/ui/logo-spinner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.login);
  const isLoading = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = searchParams.get("from") ?? "/workspace";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      router.push(from);
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  }

  return (
    <div className="w-full">
      <div
        className="mb-10 text-center animate-slide-up-fade opacity-0"
        style={{ animationDelay: "0ms" }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-codex-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-codex-muted">Sign in to your Tatalaku workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
        <div className="animate-slide-up-fade opacity-0" style={{ animationDelay: "100ms" }}>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-codex-foreground mb-1.5"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-codex-lg border border-codex-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-codex-accent focus:ring-1 focus:ring-codex-accent transition-all duration-200"
          />
        </div>

        <div className="animate-slide-up-fade opacity-0" style={{ animationDelay: "200ms" }}>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-codex-foreground mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-codex-lg border border-codex-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-codex-accent focus:ring-1 focus:ring-codex-accent transition-all duration-200 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-codex-muted hover:text-codex-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-codex-danger bg-codex-danger-bg rounded-codex-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <div className="pt-2 animate-slide-up-fade opacity-0" style={{ animationDelay: "300ms" }}>
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="relative w-full overflow-hidden rounded-codex-lg bg-codex-accent hover:bg-codex-accent/90 disabled:opacity-80 disabled:cursor-not-allowed text-codex-background font-medium text-sm py-2.5 transition-all duration-300 h-[44px] flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LogoSpinner size="sm" className="w-5 h-5 opacity-80" />
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </form>

      <p
        className="mt-8 text-center text-sm text-codex-muted animate-slide-up-fade opacity-0"
        style={{ animationDelay: "400ms" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-codex-foreground hover:text-codex-accent transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
