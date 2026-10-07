"use client";

import { useId, useState } from "react";

import { CANDIDATE_STATUSES } from "@/lib/types";

interface StatusControlProps {
  candidateId: string;
  status: string;
  disabled?: boolean;
}

type Message = { tone: "success" | "error"; text: string } | null;

export function StatusControl({
  candidateId,
  status,
  disabled = false,
}: StatusControlProps) {
  const selectId = useId();
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function handleChange(next: string) {
    if (pending || next === value) return;

    const previous = value;
    setValue(next);
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateCandidateStatus",
          candidateId,
          status: next,
        }),
      });

      let payload: { success?: boolean; message?: string } | null = null;
      try {
        payload = (await response.json()) as { success?: boolean; message?: string };
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        setValue(previous);
        setMessage({
          tone: "error",
          text: payload?.message ?? "Could not update the status. Please try again.",
        });
        return;
      }

      setMessage({ tone: "success", text: "Status updated." });
    } catch {
      setValue(previous);
      setMessage({
        tone: "error",
        text: "Unable to reach the server. Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-w-[10.5rem]">
      <label htmlFor={selectId} className="sr-only">
        Status for {candidateId}
      </label>
      <select
        id={selectId}
        className="field-input h-9 rounded-lg px-2.5 py-1.5 text-xs"
        value={value}
        disabled={disabled || pending}
        onChange={(event) => void handleChange(event.target.value)}
      >
        {CANDIDATE_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p
        aria-live="polite"
        className={`mt-1 text-[0.7rem] ${
          message?.tone === "error" ? "text-danger" : "text-success"
        }`}
      >
        {pending ? "Saving…" : message?.text ?? ""}
      </p>
    </div>
  );
}
