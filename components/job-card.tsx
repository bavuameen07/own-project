import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CurrencyIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import type { Vacancy } from "@/lib/types";
import { isOpenVacancy } from "@/lib/types";

export function jobHref(vacancyId: string): string {
  return `/jobs/${encodeURIComponent(vacancyId)}`;
}

export function applyHref(vacancyId: string): string {
  return `/apply/${encodeURIComponent(vacancyId)}`;
}

export function JobMeta({ vacancy }: { vacancy: Vacancy }) {
  const items: Array<{ icon: React.ReactNode; label: string }> = [];

  if (vacancy.Location) {
    items.push({
      icon: <MapPinIcon className="h-4 w-4" />,
      label: vacancy.Location,
    });
  }
  if (vacancy.JobType) {
    items.push({
      icon: <BriefcaseIcon className="h-4 w-4" />,
      label: vacancy.JobType,
    });
  }
  if (vacancy.Salary) {
    items.push({
      icon: <CurrencyIcon className="h-4 w-4" />,
      label: vacancy.Salary,
    });
  }

  items.push({
    icon: <UsersIcon className="h-4 w-4" />,
    label: `${vacancy.Openings} ${vacancy.Openings === 1 ? "opening" : "openings"}`,
  });

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.83rem] text-ink-soft">
      {items.map((item, index) => (
        <li key={index} className="inline-flex items-center gap-1.5">
          <span className="text-ink-faint">{item.icon}</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

interface JobCardProps {
  vacancy: Vacancy;
  index?: number;
  featured?: boolean;
}

export function JobCard({ vacancy, index = 0, featured = false }: JobCardProps) {
  const open = isOpenVacancy(vacancy);
  const delayClass =
    index >= 0 && index <= 3 ? `stagger-${index + 1}` : "";

  return (
    <article
      className={`card group flex animate-fade-up flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-card-hover)] ${delayClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold tracking-widest text-ink-faint">
          {vacancy.VacancyID}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {vacancy.JobType ? <Badge tone="neutral">{vacancy.JobType}</Badge> : null}
          {open ? (
            <Badge tone="success">Open</Badge>
          ) : (
            <Badge tone="neutral">Closed</Badge>
          )}
        </div>
      </div>

      <h3
        className={`mt-4 font-semibold tracking-tight text-ink ${
          featured ? "text-xl" : "text-[1.05rem]"
        }`}
      >
        <Link
          href={jobHref(vacancy.VacancyID)}
          className="rounded-lg transition-colors group-hover:text-accent-deep"
        >
          {vacancy.Title || "Untitled position"}
        </Link>
      </h3>

      <div className="mt-3">
        <JobMeta vacancy={vacancy} />
      </div>

      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">
        {vacancy.Description || "No description has been provided for this role yet."}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Link
          href={jobHref(vacancy.VacancyID)}
          className={`${buttonClassName("secondary", "sm")} group/btn`}
        >
          View Details
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
        {open ? (
          <Link href={applyHref(vacancy.VacancyID)} className={buttonClassName("primary", "sm")}>
            Apply Now
          </Link>
        ) : (
          <span className="text-xs font-medium text-ink-faint">
            Applications closed
          </span>
        )}
      </div>
    </article>
  );
}
