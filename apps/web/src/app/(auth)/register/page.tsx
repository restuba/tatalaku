"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ApiRequestError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.register);
  const isLoading = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.isLoading);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      await register({ name, email, password });
      router.push("/workspace");
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
        <h1 className="text-2xl font-semibold text-codex-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-codex-muted">Start building your workspace today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-codex-foreground mb-1"
          >
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-codex-lg border border-codex-border px-3 py-2 text-sm outline-none focus:border-codex-border focus:ring-2 focus:ring-codex-border/20 transition"
          />
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-codex-foreground mb-1"
          >
            Email
          </label>
          <input
            id="register-email"
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
            htmlFor="register-password"
            className="block text-sm font-medium text-codex-foreground mb-1"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-codex-lg border border-codex-border px-3 py-2 text-sm outline-none focus:border-codex-border focus:ring-2 focus:ring-codex-border/20 transition"
          />
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
          id="register-submit"
          type="submit"
          disabled={isLoading}
          className="w-full rounded-codex-lg bg-codex-accent hover:bg-codex-accent disabled:opacity-60 text-codex-background font-medium text-sm py-2.5 transition"
        >
          {isLoading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-codex-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-codex-info hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
