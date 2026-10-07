import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { isOpenVacancy, type RecruitmentGroup } from "@/lib/types";
import { getRecruitmentList, toUserMessage } from "@/lib/recruitment-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

function candidateNumber(candidateId: string): number {
  const digits = candidateId.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function vacancyTimestamp(value: string): number {
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value.trim())
    ? value.trim().replace(" ", "T")
    : value.trim();
  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export default async function AdminDashboardPage() {
  let groups: RecruitmentGroup[];

  try {
    groups = await getRecruitmentList();
  } catch (error) {
    return (
      <div className="space-y-8">
        <AdminPageHeader title="Dashboard" description="Recruitment overview." />
        <ErrorState
          title="Unable to load the dashboard"
          message={toUserMessage(error, "Unable to load recruitment data.")}
        />
      </div>
    );
  }

  const candidates = groups.flatMap((group) => group.candidates);
  const statusCount = (status: string) =>
    candidates.filter(
      (candidate) => candidate.Status.trim().toLowerCase() === status.toLowerCase(),
    ).length;

  const stats = [
    {
      label: "Open Vacancies",
      value: groups.filter((group) => isOpenVacancy(group.vacancy)).length,
      hint: `${groups.length} total listed`,
      tone: "accent" as const,
      icon: <BriefcaseIcon className="h-5 w-5" />,
    },
    {
      label: "Total Candidates",
      value: candidates.length,
      hint: "Across all vacancies",
      tone: "neutral" as const,
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      label: "New Applications",
      value: statusCount("New"),
      hint: "Awaiting first review",
      tone: "success" as const,
      icon: <ClockIcon className="h-5 w-5" />,
    },
    {
      label: "Shortlisted",
      value: statusCount("Shortlisted"),
      hint: "Moved forward",
      tone: "warning" as const,
      icon: <CheckIcon className="h-5 w-5" />,
    },
    {
      label: "Interview",
      value: statusCount("Interview"),
      hint: "In interview stage",
      tone: "violet" as const,
      icon: <ChartIcon className="h-5 w-5" />,
    },
    {
      label: "Selected",
      value: statusCount("Selected"),
      hint: "Offers / hires",
      tone: "success" as const,
      icon: <CheckIcon className="h-5 w-5" />,
    },
  ];

  const recentCandidates = [...candidates]
    .sort((a, b) => candidateNumber(b.CandidateID) - candidateNumber(a.CandidateID))
    .slice(0, 6);

  const recentVacancies = [...groups]
    .map((group) => group.vacancy)
    .sort((a, b) => vacancyTimestamp(b.CreatedAt) - vacancyTimestamp(a.CreatedAt))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Live recruitment overview pulled straight from the recruitment sheet."
        action={<RefreshButton />}
      />

      <section aria-label="Key statistics">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              tone={stat.tone}
              icon={stat.icon}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href="/admin/vacancies/new" size="sm">
          <PlusIcon className="h-4 w-4" />
          Add Vacancy
        </ButtonLink>
        <ButtonLink href="/admin/candidates" variant="secondary" size="sm">
          View Candidates
        </ButtonLink>
        <ButtonLink href="/admin/vacancies" variant="secondary" size="sm">
          View Vacancies
        </ButtonLink>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="recent-applications-heading"
          className="card animate-fade-up p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id="recent-applications-heading"
              className="text-base font-semibold tracking-tight text-ink"
            >
              Recent applications
            </h2>
            <Link
              href="/admin/candidates"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              View all
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-5">
            {recentCandidates.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Applications submitted through the website will appear here."
              />
            ) : (
              <ul className="divide-y divide-line">
                {recentCandidates.map((candidate) => (
                  <li key={candidate.CandidateID}>
                    <Link
                      href={`/admin/candidates/${encodeURIComponent(candidate.CandidateID)}`}
                      className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-canvas"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {candidate.FullName || "Unnamed candidate"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-ink-faint">
                          {candidate.CandidateID} ·{" "}
                          {candidate.VacancyTitle || candidate.VacancyID}
                        </p>
                      </div>
                      <StatusBadge status={candidate.Status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section
          aria-labelledby="recent-vacancies-heading"
          className="card animate-fade-up stagger-1 p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id="recent-vacancies-heading"
              className="text-base font-semibold tracking-tight text-ink"
            >
              Recent vacancies
            </h2>
            <Link
              href="/admin/vacancies"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              View all
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-5">
            {recentVacancies.length === 0 ? (
              <EmptyState
                title="No vacancies found"
                description="Create your first vacancy to start receiving applications."
                action={{ label: "Add vacancy", href: "/admin/vacancies/new" }}
              />
            ) : (
              <ul className="divide-y divide-line">
                {recentVacancies.map((vacancy) => (
                  <li key={vacancy.VacancyID}>
                    <Link
                      href={`/admin/vacancies/${encodeURIComponent(vacancy.VacancyID)}`}
                      className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-canvas"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {vacancy.Title || "Untitled vacancy"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-ink-faint">
                          {vacancy.VacancyID} · {vacancy.Openings}{" "}
                          {vacancy.Openings === 1 ? "opening" : "openings"}
                          {vacancy.Location ? ` · ${vacancy.Location}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={vacancy.Status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <p className="text-xs text-ink-faint">
        Statistics are calculated from the live recruitment data — nothing on this
        page is simulated.
      </p>
    </div>
  );
}
