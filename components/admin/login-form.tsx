"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

interface LoginResponse {
  success?: boolean;
  message?: string;
}

export function LoginForm({ nextUrl }: { nextUrl: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      let payload: LoginResponse | null = null;
      try {
        payload = (await response.json()) as LoginResponse;
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        setError(payload?.message ?? "Invalid username or password.");
        setSubmitting(false);
        return;
      }

      window.location.assign(nextUrl || "/admin");
    } catch {
      setError("We could not reach the server. Please try again.");
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

      <Button type="submit" size="lg" fullWidth disabled={submitting}>
        {submitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
