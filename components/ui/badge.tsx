import { CANDIDATE_STATUSES, isCandidateStatus } from "@/lib/types";

export type BadgeTone =
  | "neutral"
  | "info"
  | "warning"
  | "violet"
  | "success"
  | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-line-strong bg-surface-muted text-ink-soft",
  info: "border-accent/25 bg-accent-soft text-accent-deep",
  warning: "border-warning/30 bg-warning-soft text-warning",
  violet: "border-violet/25 bg-violet-soft text-violet",
  success: "border-success/25 bg-success-soft text-success",
  danger: "border-danger/25 bg-danger-soft text-danger",
};

const STATUS_TONES: Record<string, BadgeTone> = {
  New: "info",
  Shortlisted: "warning",
  Interview: "violet",
  Selected: "success",
  Rejected: "danger",
  Open: "success",
  Closed: "neutral",
};

export function statusTone(status: string): BadgeTone {
  return STATUS_TONES[status.trim()] ?? "neutral";
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const value = status || "Unknown";
  return (
    <Badge tone={statusTone(value)}>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
      />
      {value}
    </Badge>
  );
}

export function WhatsAppBadge({ value }: { value: string }) {
  const sent = value.trim().toLowerCase() === "yes";
  return <Badge tone={sent ? "success" : "neutral"}>{sent ? "Sent" : "Not sent"}</Badge>;
}

export const STATUS_OPTIONS = CANDIDATE_STATUSES;

export { isCandidateStatus };
