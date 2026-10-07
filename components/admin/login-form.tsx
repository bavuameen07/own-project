"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

interface LoginFormProps {
  nextUrl: string;
}

export function LoginForm({ nextUrl }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      let payload: { success?: boolean; message?: string } | null = null;
      try {
        payload = (await response.json()) as { success?: boolean; message?: string };
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        setError(
          payload?.message ?? "Unable to sign in right now. Please try again.",
        );
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } catch {
      setError(
        "Unable to reach the server. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="username" className="field-label">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          className="field-input"
          placeholder="Enter your username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={error ? true : undefined}
          disabled={submitting}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="field-input"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={error ? true : undefined}
          disabled={submitting}
          required
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      ) : null}

      <Button type="submit" fullWidth size="lg" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
