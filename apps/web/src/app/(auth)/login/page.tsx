"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ApiRequestError } from "@/helpers/api-error";
import { toSameOriginPath } from "@/lib/url";
import { Button } from "@/components/reusable/button";
import { Input } from "@/components/reusable/input";
import { FormError, PasswordField } from "../_components";

const DEFAULT_REDIRECT = "/workspace";
const ERROR_ID = "login-error";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.login);
  const isLoading = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      // `?from=` is read at submit time (not via useSearchParams) so the page
      // prerenders the full form instead of a Suspense fallback, and only
      // same-origin paths are honored (no open redirect).
      const from = new URLSearchParams(window.location.search).get("from");
      router.push(toSameOriginPath(from, window.location.origin, DEFAULT_REDIRECT));
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
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-normal leading-tight text-codex-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-codex-muted">Sign in to your Tatalaku workspace.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        id="login-form"
        aria-describedby={error ? ERROR_ID : undefined}
      >
        <Input
          id="login-email"
          label="Email"
          size="large"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
        />

        {error && <FormError id={ERROR_ID} message={error} />}

        <div className="pt-2">
          <Button
            id="login-submit"
            htmlType="submit"
            btnType="primary"
            size="large"
            block
            loading={isLoading}
          >
            Sign in
          </Button>
        </div>
      </form>

      <p className="mt-8 text-sm text-codex-muted">
        New to Tatalaku?{" "}
        <Link
          href="/register"
          className="font-medium text-codex-accent underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
