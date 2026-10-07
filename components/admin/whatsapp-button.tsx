"use client";

import { useState } from "react";

import { buttonClassName } from "@/components/ui/button";
import { MessageIcon } from "@/components/ui/icons";
import { toWhatsAppNumber } from "@/lib/format";

interface WhatsAppButtonProps {
  candidateId: string;
  candidateName: string;
  phone: string;
  vacancyTitle: string;
  whatsappSent: string;
}

type Message = { tone: "success" | "error"; text: string } | null;

export function WhatsAppButton({
  candidateId,
  candidateName,
  phone,
  vacancyTitle,
  whatsappSent,
}: WhatsAppButtonProps) {
  const [sent, setSent] = useState(whatsappSent.trim().toLowerCase() === "yes");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const digits = toWhatsAppNumber(phone);
  const firstName = candidateName.trim().split(/\s+/)[0] || "there";
  const role = vacancyTitle.trim() || "the role";
  const prefilled = `Hi ${firstName}, thank you for applying for the ${role} position. We would like to discuss the next steps with you.`;

  const canOpen = digits.length >= 7;

  async function toggleSent() {
    if (pending) return;

    const next = sent ? "No" : "Yes";
    const previous = sent;
    setSent(!previous);
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateWhatsAppStatus",
          candidateId,
          whatsappSent: next,
        }),
      });

      let payload: { success?: boolean; message?: string } | null = null;
      try {
        payload = (await response.json()) as { success?: boolean; message?: string };
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        setSent(previous);
        setMessage({
          tone: "error",
          text: payload?.message ?? "Could not update WhatsApp status.",
        });
        return;
      }

      setMessage({ tone: "success", text: `Marked as ${next.toLowerCase()}.` });
    } catch {
      setSent(previous);
      setMessage({
        tone: "error",
        text: "Unable to reach the server. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {canOpen ? (
          <a
            href={`https://wa.me/${digits}?text=${encodeURIComponent(prefilled)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName("secondary", "sm")}
            title="Open WhatsApp with a pre-filled message"
          >
            <MessageIcon className="h-4 w-4 text-[#25D366]" />
            WhatsApp
          </a>
        ) : (
          <span
            aria-disabled="true"
            className={`${buttonClassName("secondary", "sm")} cursor-not-allowed opacity-50`}
            title="No valid phone number available"
          >
            <MessageIcon className="h-4 w-4" />
            WhatsApp
          </span>
        )}

        <button
          type="button"
          onClick={() => void toggleSent()}
          disabled={pending}
          className={buttonClassName(
            sent ? "ghost" : "accent",
            "sm",
            "min-w-[9.5rem]",
          )}
        >
          {pending
            ? "Saving…"
            : sent
              ? "Marked as sent"
              : "Mark WhatsApp as Sent"}
        </button>
      </div>

      <p
        aria-live="polite"
        className={`text-[0.7rem] ${
          message?.tone === "error" ? "text-danger" : "text-ink-faint"
        }`}
      >
        {message?.text ??
          (canOpen
            ? "Opens WhatsApp in a new tab — nothing is sent automatically."
            : "A valid phone number is required.")}
      </p>
    </div>
  );
}
