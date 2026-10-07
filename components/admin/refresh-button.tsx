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

  return (
    <button
      type="button"
      onClick={() => {
        setRefreshing(true);
        router.refresh();
        window.setTimeout(() => setRefreshing(false), 1000);
      }}
      disabled={refreshing}
      className={buttonClassName("secondary", "sm", className)}
    >
      <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
      {refreshing ? "Refreshing…" : label}
    </button>
  );
}
