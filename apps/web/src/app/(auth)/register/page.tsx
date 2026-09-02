"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { ApiRequestError } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";
import { LogoSpinner } from "@/components/ui/logo-spinner";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.register);
  const isLoading = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.isLoading);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full">
      <div
        className="mb-10 text-center animate-slide-up-fade opacity-0"
        style={{ animationDelay: "0ms" }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-codex-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-codex-muted">Start building your workspace today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
        <div className="animate-slide-up-fade opacity-0" style={{ animationDelay: "100ms" }}>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-codex-foreground mb-1.5"
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
            className="w-full rounded-codex-lg border border-codex-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-codex-accent focus:ring-1 focus:ring-codex-accent transition-all duration-200"
          />
        </div>

        <div className="animate-slide-up-fade opacity-0" style={{ animationDelay: "200ms" }}>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-codex-foreground mb-1.5"
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
            className="w-full rounded-codex-lg border border-codex-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-codex-accent focus:ring-1 focus:ring-codex-accent transition-all duration-200"
          />
        </div>

        <div className="animate-slide-up-fade opacity-0" style={{ animationDelay: "300ms" }}>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-codex-foreground mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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

        <div className="pt-2 animate-slide-up-fade opacity-0" style={{ animationDelay: "400ms" }}>
          <button
            id="register-submit"
            type="submit"
            disabled={isLoading}
            className="relative w-full overflow-hidden rounded-codex-lg bg-codex-accent hover:bg-codex-accent/90 disabled:opacity-80 text-codex-background font-medium text-sm py-2.5 transition-all duration-300 h-[44px] flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LogoSpinner size="sm" className="w-5 h-5 opacity-80" />
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </div>
      </form>

      <p
        className="mt-8 text-center text-sm text-codex-muted animate-slide-up-fade opacity-0"
        style={{ animationDelay: "500ms" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-codex-foreground hover:text-codex-accent transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
