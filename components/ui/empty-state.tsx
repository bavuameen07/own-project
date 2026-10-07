import type { ReactNode } from "react";

import { buttonClassName } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; href: string };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="card animate-fade-in flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface-muted text-ink-soft">
        {icon ?? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 14.15v4.07a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-4.07m16.5 0a2.25 2.25 0 0 0 1.125-1.966V6.75A2.25 2.25 0 0 0 18.375 4.5H3.625A2.25 2.25 0 0 0 1.5 6.75v5.434c0 .85.46 1.633 1.125 1.966m16.5 0a2.24 2.24 0 0 1-1.125.284h-3.75a2.24 2.24 0 0 1-1.125-.284m0 0a2.25 2.25 0 0 1-2.25-2.25V6.75m10.5 3.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
            />
          </svg>
        )}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
      {action ? (
        <a href={action.href} className={`${buttonClassName("secondary", "md")} mt-6`}>
          {action.label}
        </a>
      ) : null}
    </div>
  );
}
