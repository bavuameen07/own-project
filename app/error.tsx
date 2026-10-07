"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Only the digest is logged so internal messages never reach the console.
    console.error("Application error", error.digest);
  }, [error]);

  return (
    <div className="page-container py-24 text-center sm:py-32">
      <p className="text-sm font-semibold tracking-[0.2em] text-danger">Error</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <div className="mt-8 flex justify-center">
        <Button onClick={reset} variant="secondary" size="lg">
          Try Again
        </Button>
      </div>
    </div>
  );
}
