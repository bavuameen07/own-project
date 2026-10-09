"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LoginForm({ nextUrl }: { nextUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-border bg-background p-8 text-center">
      <h2 className="mb-4 text-xl font-semibold text-ink">
        Admin sign in
      </h2>
      <p className="mb-6 text-base text-text-soft">
        Admin authentication is not currently configured.
      </p>
      <Button
        disabled
        className="w-full"
      >
        Sign In
      </Button>
    </div>
  );
}