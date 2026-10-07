"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonClassName } from "@/components/ui/button";
import { RefreshIcon } from "@/components/ui/icons";

export function RefreshButton({
  label = "Refresh",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      // Drop the server-side read cache first so the reload is truly fresh.
      await fetch("/api/recruitment/refresh", { method: "POST" }).catch(
        () => null,
      );
    } finally {
      router.refresh();
      window.setTimeout(() => setRefreshing(false), 800);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void refresh()}
      disabled={refreshing}
      className={buttonClassName("secondary", "sm", className)}
    >
      <RefreshIcon
        className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
      />
      {refreshing ? "Refreshing…" : label}
    </button>
  );
}
