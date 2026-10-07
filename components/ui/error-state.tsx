"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
}: ErrorStateProps) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  function handleRetry() {
    if (onRetry) {
      onRetry();
      return;
    }
    setRetrying(true);
    router.refresh();
    window.setTimeout(() => setRetrying(false), 1200);
  }

  return (
    <div
      role="alert"
      className="card animate-fade-in flex flex-col items-center border-danger/25 bg-danger-soft/40 px-6 py-14 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-danger/25 bg-surface text-danger">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{message}</p>
      <Button variant="secondary" className="mt-6" onClick={handleRetry} disabled={retrying}>
        {retrying ? "Retrying…" : retryLabel}
      </Button>
    </div>
  );
}
