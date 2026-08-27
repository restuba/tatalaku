"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ApiRequestError } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

import { Suspense } from "react";

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
    <div className="bg-codex-background rounded-codex-2xl border border-codex-border p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-codex-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-codex-muted">Sign in to your Tatalaku workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-codex-foreground mb-1"
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
            className="w-full rounded-codex-lg border border-codex-border px-3 py-2 text-sm outline-none focus:border-codex-border focus:ring-2 focus:ring-codex-border/20 transition"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-codex-foreground mb-1"
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
              className="w-full rounded-codex-lg border border-codex-border px-3 py-2 text-sm outline-none focus:border-codex-border focus:ring-2 focus:ring-codex-border/20 transition pr-10"
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

        <button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full rounded-codex-lg bg-codex-accent hover:bg-codex-accent disabled:opacity-60 text-codex-background font-medium text-sm py-2.5 transition"
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-codex-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-codex-info hover:underline">
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
