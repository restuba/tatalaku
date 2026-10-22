"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ApiRequestError } from "@/helpers/api-error";
import { Button } from "@/components/reusable/button";
import { Input } from "@/components/reusable/input";
import { FormError, PasswordField } from "../_components";

const ERROR_ID = "register-error";
const PASSWORD_HINT_ID = "register-password-hint";

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
    <div className="w-full">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-normal leading-tight text-codex-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-codex-muted">
          A calm place for your notes, documents and plans.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        id="register-form"
        aria-describedby={error ? ERROR_ID : undefined}
      >
        <Input
          id="register-name"
          label="Full name"
          size="large"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={setName}
          placeholder="Your name"
        />

        <Input
          id="register-email"
          label="Email"
          size="large"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        <div className="space-y-1.5">
          <PasswordField
            id="register-password"
            label="Password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            describedBy={PASSWORD_HINT_ID}
          />
          <p id={PASSWORD_HINT_ID} className="text-xs text-codex-muted">
            Use 8 or more characters.
          </p>
        </div>

        {error && <FormError id={ERROR_ID} message={error} />}

        <div className="pt-2">
          <Button
            id="register-submit"
            htmlType="submit"
            btnType="primary"
            size="large"
            block
            loading={isLoading}
          >
            Create account
          </Button>
        </div>
      </form>

      <p className="mt-8 text-sm text-codex-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-codex-accent underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
