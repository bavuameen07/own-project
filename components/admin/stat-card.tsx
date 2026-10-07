import type { ReactNode } from "react";

type StatTone = "neutral" | "accent" | "success" | "warning" | "violet" | "danger";

const TONE_CLASSES: Record<StatTone, string> = {
  neutral: "bg-surface-muted text-ink-soft",
  accent: "bg-accent-soft text-accent-deep",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-soft text-violet",
  danger: "bg-danger-soft text-danger",
};

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ReactNode;
  tone?: StatTone;
}

export function StatCard({ label, value, hint, icon, tone = "neutral" }: StatCardProps) {
  return (
    <div className="card animate-fade-up p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          {label}
        </p>
        {icon ? (
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}
